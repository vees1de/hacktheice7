import os
import json
import asyncio
import asyncpg
from datetime import date
from dotenv import load_dotenv

from translation_service import ensure_russian, answer_back_in_original_lang
from semantic_parser import llm_parse_query

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
YANDEX_API_KEY = os.getenv("YANDEX_API_KEY")
YANDEX_FOLDER_ID = os.getenv("YANDEX_FOLDER_ID")
SMART_SEARCH_SCOPE = os.getenv("SMART_SEARCH_SCOPE", "personal")
SMART_SEARCH_USER_ID = os.getenv("SMART_SEARCH_USER_ID")

YANDEX_MODEL_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"

CATEGORY_HINTS = {
    "PENSIONER": ["пенсион", "пенсия", "пенсионер"],
    "LOW_INCOME": ["малоимущ", "низкий доход", "невысокий доход"],
    "MULTICHILD_PARENT": ["многодет", "многодетная", "большая семья"],
    "STUDENT": ["студент", "учеба", "университет", "институт"],
    "VETERAN": ["ветеран"],
    "DISABLED_1": ["инвалид 1", "инвалид i"],
    "DISABLED_2": ["инвалид 2", "инвалид ii"],
    "DISABLED_3": ["инвалид 3", "инвалид iii"],
    "DISABLED_CHILD_PARENT": ["ребенок-инвалид", "ребёнок-инвалид", "родитель ребенка-инвалида"],
    "RESIDENTS_NORTH_REGIONS": ["север", "крайнего севера"]
}

TYPE_HINTS = {
    "housing": ["жкх", "коммун", "капремонт", "квартплата"],
    "medical": ["медицин", "здоров", "лекар"],
    "transport": ["транспорт", "проезд", "автобус", "метро", "трамвай"],
    "social": ["социал", "соц"],
    "federal": ["федерал"],
    "regional": ["регион"],
    "commercial": ["акция", "скидк", "предложение"],
    "tax": ["налог", "вычет"],
    "family": ["семь", "родител", "детей"],
    "education": ["учеб", "образован", "студент", "университет"]
}


def unique_list(items):
    seen = set()
    result = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


def guess_categories(text: str):
    found = []
    for code, hints in CATEGORY_HINTS.items():
        for h in hints:
            if h in text:
                found.append(code)
                break
    return found


def guess_types(text: str):
    found = []
    for code, hints in TYPE_HINTS.items():
        for h in hints:
            if h in text:
                found.append(code)
                break
    return found


async def db():
    return await asyncpg.connect(DATABASE_URL)

async def load_region_id(conn, code):
    row = await conn.fetchrow("SELECT id FROM region WHERE code = $1", code)
    return row["id"] if row else None

async def load_categories(conn):
    rows = await conn.fetch("SELECT id, name, title FROM beneficiary_category")
    return {r["id"]: r for r in rows}

async def load_user_context(conn, user_id: str):
    if not user_id:
        return None

    user_row = await conn.fetchrow(
        """
        SELECT id, "region_id" as region_id
        FROM "user"
        WHERE id = $1
        """,
        user_id,
    )

    if not user_row:
        return None

    category_rows = await conn.fetch(
        """
        SELECT "categoryId" 
        FROM user_beneficiary_category
        WHERE "userId" = $1 AND confirmed = true
        """,
        user_id,
    )

    return {
        "region_id": user_row["region_id"],
        "category_ids": [row["categoryId"] for row in category_rows],
    }

async def load_benefits(conn, region_id=None, category_ids=None):
    conditions = []
    params = []

    if region_id:
        conditions.append(f'br."regionId" = ${len(params) + 1}')
        params.append(region_id)

    if category_ids:
        conditions.append(
            f'''EXISTS (
                SELECT 1 FROM benefit_beneficiary_category bbc2
                WHERE bbc2."benefitId" = b.id
                  AND bbc2."categoryId" = ANY(${len(params) + 1})
            )'''
        )
        params.append(category_ids)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT 
          b.id,
          b.title,
          b.description,
          b.type,
          b.valid_from,
          b.valid_to,
          b.requirements,
          b."howToGet",
          b.source_url,
          array_agg(DISTINCT bbc."categoryId") AS category_ids
        FROM benefit b
        JOIN benefit_region br ON br."benefitId" = b.id
        LEFT JOIN benefit_beneficiary_category bbc ON bbc."benefitId" = b.id
        {where_clause}
        GROUP BY b.id
    """

    return await conn.fetch(query, *params)

def score_benefit(benefit, query, category_index):
    score = 0
    title = (benefit.get("title") or "").lower()
    description = (benefit.get("description") or "").lower()
    requirements = (benefit.get("requirements") or "").lower()
    how_to_get = (benefit.get("howToGet") or "").lower()
    benefit_type = (benefit.get("type") or "").lower()
    text_full = " ".join([title, description, requirements, how_to_get])
    benefit_category_names = set()
    for cid in benefit.get("category_ids") or []:
        cat = category_index.get(cid)
        if cat and cat.get("name"):
            benefit_category_names.add(cat["name"])

    for c in query["categories"]:
        if c in benefit_category_names:
            score += 6
            continue
        # прямое совпадение кодов категорий по заголовку/описанию
        if c.lower() in text_full:
            score += 2

    for t in query["types"]:
        t_lower = t.lower()
        if t_lower in benefit_type:
          score += 3
        else:
          for hint in TYPE_HINTS.get(t, []):
              if hint in benefit_type:
                  score += 2
                  break

    for k in query["keywords"]:
        k = k.lower().strip()
        if len(k) < 3:
            continue
        if k in title:
            score += 2
        elif k in text_full:
            score += 1

    vt = benefit.get("valid_to")
    if vt and hasattr(vt, "date") and vt.date() >= date.today():
        score += 1

    return score

async def smart_benefit_search(user_text: str):
    # 1. Перевод
    norm = ensure_russian(user_text)
    text_ru = norm["text_ru"]
    orig_lang = norm["original_lang"]

    # 2. Семантический анализ
    semantic = llm_parse_query(text_ru)
    text_norm = text_ru.lower()
    semantic["categories"] = unique_list(
        semantic.get("categories", []) + guess_categories(text_norm)
    )
    semantic["types"] = unique_list(
        semantic.get("types", []) + guess_types(text_norm)
    )
    semantic["keywords"] = unique_list(semantic.get("keywords", []))

    conn = await db()

    try:
        benefits = []
        if SMART_SEARCH_SCOPE == "personal":
            user_context = await load_user_context(conn, SMART_SEARCH_USER_ID)
            if not user_context:
                raise ValueError("USER_CONTEXT_NOT_FOUND")

            category_ids = user_context["category_ids"]
            if not category_ids:
                benefits = []
            else:
                benefits = await load_benefits(
                    conn,
                    region_id=user_context["region_id"],
                    category_ids=category_ids,
                )
        else:
            region_id = await load_region_id(conn, semantic["region_code"])
            benefits = await load_benefits(conn, region_id=region_id)

        categories = await load_categories(conn)

        scored = [(score_benefit(b, semantic, categories), b) for b in benefits]
        scored.sort(key=lambda x: x[0], reverse=True)

        top = [x for x in scored if x[0] > 1][:3]
        if not top:
            top = scored[:3]

        items = []
        for sc, b in top:
            cats = []
            for cid in b["category_ids"] or []:
                if cid in categories:
                    cats.append(categories[cid]["title"])

            items.append({
                "id": b["id"],
                "title": b["title"],
                "categories": cats,
                "type": b["type"],
                "valid_to": str(b["valid_to"]),
                "howToGet": b["howToGet"],
                "requirements": b["requirements"],
                "source_url": b["source_url"],
                "score": sc
            })

        # Формируем простой текст
        lines = ["Я нашёл подходящие льготы:\n"]
        for i, it in enumerate(items, 1):
            lines.append(
                f"{i}) {it['title']}\n"
                f"   Категории: {', '.join(it['categories']) or '—'}\n"
                f"   Тип: {it['type']}\n"
                f"   Действует до: {it['valid_to']}\n"
                f"   Как получить: {it['howToGet']}\n"
            )

        answer_ru = "\n".join(lines)

        translated = answer_back_in_original_lang(answer_ru, orig_lang)

        return {
            "query_ru": text_ru,
            "detected_lang": orig_lang,
            "answer_ru": answer_ru,
            "answer_final": translated["answer_final"],
            "items": items
        }

    finally:
        await conn.close()

if __name__ == "__main__":
    import sys, json

    text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else ""
    try:
        result = asyncio.run(smart_benefit_search(text))
        print(json.dumps({"ok": True, **result}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
