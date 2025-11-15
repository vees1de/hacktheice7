<script setup lang="ts">
import { adminApi } from '@entities/admin';
import { useAuthStore } from '@entities/auth';
import {
  BeneficiaryCategory,
  BeneficiaryCategoryType,
  beneficiaryCategoryApi
} from '@entities/beneficiary';
import { Benefit, benefitApi } from '@entities/benefit';
import { Offer, offerApi } from '@entities/offer';
import { Region, regionApi } from '@entities/region';
import { onMounted, reactive, ref } from 'vue';

const authStore = useAuthStore();

const loading = reactive({
  refs: false,
  offers: false,
  benefits: false,
  login: false,
  createOffer: false,
  createBenefit: false,
  userCategory: false
});

const errors = reactive({
  login: '',
  refs: '',
  createOffer: '',
  createBenefit: '',
  userCategory: ''
});

const regions = ref<Region[]>([]);
const categories = ref<BeneficiaryCategory[]>([]);
const offers = ref<Offer[]>([]);
const benefits = ref<Benefit[]>([]);

const authForm = reactive({
  phone: '',
  password: ''
});

const offerForm = reactive({
  title: '',
  description: '',
  partnerName: '',
  partnerLogo: '',
  discount: '',
  validFrom: '',
  validTo: '',
  terms: '',
  link: '',
  regionIds: [] as string[],
  categoryIds: [] as string[]
});

const benefitForm = reactive({
  title: '',
  description: '',
  type: '',
  validFrom: '',
  validTo: '',
  requirements: '',
  howToGet: '',
  sourceUrl: '',
  regionIds: [] as string[],
  categoryIds: [] as string[]
});

const userCategoryForm = reactive({
  userId: '',
  category: '' as BeneficiaryCategoryType | ''
});

const userCategoryStatus = ref('');

const loadRefs = async () => {
  loading.refs = true;
  errors.refs = '';
  try {
    const [regionList, categoryList] = await Promise.all([
      regionApi.getAll(),
      beneficiaryCategoryApi.getAll()
    ]);
    regions.value = regionList;
    categories.value = categoryList;
  } catch (error: any) {
    errors.refs = error?.message || 'Не удалось загрузить справочники';
  } finally {
    loading.refs = false;
  }
};

const loadOffers = async () => {
  loading.offers = true;
  try {
    offers.value = await offerApi.getAll();
  } finally {
    loading.offers = false;
  }
};

const loadBenefits = async () => {
  loading.benefits = true;
  try {
    benefits.value = await benefitApi.getAll();
  } finally {
    loading.benefits = false;
  }
};

const handleLogin = async () => {
  errors.login = '';
  loading.login = true;
  try {
    await authStore.login({
      phone: authForm.phone,
      password: authForm.password
    });
    await loadOffers();
    await loadBenefits();
  } catch (error: any) {
    errors.login =
      error?.response?.data?.message || error?.message || 'Ошибка входа';
  } finally {
    loading.login = false;
  }
};

const handleCreateOffer = async () => {
  errors.createOffer = '';
  loading.createOffer = true;
  try {
    await offerApi.create({
      ...offerForm,
      validFrom: new Date(offerForm.validFrom).toISOString(),
      validTo: new Date(offerForm.validTo).toISOString()
    });
    await loadOffers();
    Object.assign(offerForm, {
      title: '',
      description: '',
      partnerName: '',
      partnerLogo: '',
      discount: '',
      validFrom: '',
      validTo: '',
      terms: '',
      link: '',
      regionIds: [],
      categoryIds: []
    });
  } catch (error: any) {
    errors.createOffer =
      error?.response?.data?.message ||
      error?.message ||
      'Не удалось создать оффер';
  } finally {
    loading.createOffer = false;
  }
};

const handleCreateBenefit = async () => {
  errors.createBenefit = '';
  loading.createBenefit = true;
  try {
    await benefitApi.create({
      ...benefitForm,
      validFrom: new Date(benefitForm.validFrom).toISOString(),
      validTo: new Date(benefitForm.validTo).toISOString()
    });
    await loadBenefits();
    Object.assign(benefitForm, {
      title: '',
      description: '',
      type: '',
      validFrom: '',
      validTo: '',
      requirements: '',
      howToGet: '',
      sourceUrl: '',
      regionIds: [],
      categoryIds: []
    });
  } catch (error: any) {
    errors.createBenefit =
      error?.response?.data?.message ||
      error?.message ||
      'Не удалось создать льготу';
  } finally {
    loading.createBenefit = false;
  }
};

const submitUserCategory = async (action: 'add' | 'remove') => {
  userCategoryStatus.value = 'Отправка...';
  loading.userCategory = true;
  try {
    const { userId, category } = userCategoryForm;
    if (!userId || !category) {
      throw new Error('Укажите пользователя и категорию');
    }
    if (action === 'add') {
      await adminApi.addCategory(userId, category as BeneficiaryCategoryType);
    } else {
      await adminApi.removeCategory(
        userId,
        category as BeneficiaryCategoryType
      );
    }
    userCategoryStatus.value = 'Успешно';
  } catch (error: any) {
    userCategoryStatus.value =
      error?.response?.data?.message ||
      error?.message ||
      'Не удалось обновить категории';
  } finally {
    loading.userCategory = false;
  }
};

onMounted(async () => {
  await loadRefs();
  await Promise.all([loadOffers(), loadBenefits()]);
});
</script>

<template>
  <div class="admin-page">
    <section class="panel">
      <header class="panel__header">
        <div>
          <h1>Админ-панель</h1>
          <p>Работа с бэкендом без моков: офферы, льготы, категории.</p>
        </div>
        <div class="login">
          <input
            v-model="authForm.phone"
            type="text"
            placeholder="Телефон"
          />
          <input
            v-model="authForm.password"
            type="password"
            placeholder="Пароль"
          />
          <button
            :disabled="loading.login"
            @click="handleLogin"
          >
            {{ loading.login ? 'Вход...' : 'Войти' }}
          </button>
          <p
            v-if="errors.login"
            class="error"
          >
            {{ errors.login }}
          </p>
        </div>
      </header>
    </section>

    <section class="panel">
      <header class="panel__header">
        <div>
          <h2>Справочники</h2>
          <p>Регионы и категории льгот, подтягиваются с бэкенда.</p>
        </div>
        <p v-if="loading.refs">Загрузка...</p>
        <p
          v-if="errors.refs"
          class="error"
        >
          {{ errors.refs }}
        </p>
      </header>
      <div class="grid">
        <div>
          <h3>Регионы</h3>
          <ul class="chips">
            <li
              v-for="r in regions"
              :key="r.id"
            >
              {{ r.name }} ({{ r.code }})
            </li>
          </ul>
        </div>
        <div>
          <h3>Категории льгот</h3>
          <ul class="chips">
            <li
              v-for="c in categories"
              :key="c.id"
            >
              {{ c.title || c.name }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="panel__header">
        <div>
          <h2>Офферы</h2>
          <p>Создание и список офферов (требуется staff профиль).</p>
        </div>
        <p v-if="loading.offers">Загрузка...</p>
      </header>
      <div class="form">
        <input
          v-model="offerForm.title"
          placeholder="Название"
        />
        <input
          v-model="offerForm.partnerName"
          placeholder="Партнер"
        />
        <input
          v-model="offerForm.discount"
          placeholder="Скидка"
        />
        <input
          v-model="offerForm.validFrom"
          type="date"
        />
        <input
          v-model="offerForm.validTo"
          type="date"
        />
        <input
          v-model="offerForm.terms"
          placeholder="Условия"
        />
        <textarea
          v-model="offerForm.description"
          placeholder="Описание"
        ></textarea>
        <div class="two-col">
          <label
            >Регионы:
            <select
              v-model="offerForm.regionIds"
              multiple
            >
              <option
                v-for="r in regions"
                :key="r.id"
                :value="r.id"
              >
                {{ r.name }}
              </option>
            </select>
          </label>
          <label
            >Категории:
            <select
              v-model="offerForm.categoryIds"
              multiple
            >
              <option
                v-for="c in categories"
                :key="c.id"
                :value="c.id"
              >
                {{ c.title || c.name }}
              </option>
            </select>
          </label>
        </div>
        <button
          :disabled="loading.createOffer"
          @click="handleCreateOffer"
        >
          {{ loading.createOffer ? 'Создание...' : 'Создать оффер' }}
        </button>
        <p
          v-if="errors.createOffer"
          class="error"
        >
          {{ errors.createOffer }}
        </p>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Партнер</th>
            <th>Скидка</th>
            <th>Период</th>
            <th>Категории</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="offer in offers"
            :key="offer.id"
          >
            <td>{{ offer.title }}</td>
            <td>{{ offer.partnerName }}</td>
            <td>{{ offer.discount }}</td>
            <td>
              {{ offer.validFrom?.slice(0, 10) }} —
              {{ offer.validTo?.slice(0, 10) }}
            </td>
            <td>
              <span
                class="badge"
                v-for="cat in offer.offerCategories || []"
                :key="cat.beneficiaryCategory.id"
              >
                {{
                  cat.beneficiaryCategory.title || cat.beneficiaryCategory.name
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="panel">
      <header class="panel__header">
        <div>
          <h2>Льготы</h2>
          <p>Создание и список льгот.</p>
        </div>
        <p v-if="loading.benefits">Загрузка...</p>
      </header>
      <div class="form">
        <input
          v-model="benefitForm.title"
          placeholder="Название"
        />
        <input
          v-model="benefitForm.type"
          placeholder="Тип"
        />
        <input
          v-model="benefitForm.validFrom"
          type="date"
        />
        <input
          v-model="benefitForm.validTo"
          type="date"
        />
        <input
          v-model="benefitForm.requirements"
          placeholder="Требования"
        />
        <input
          v-model="benefitForm.howToGet"
          placeholder="Как получить"
        />
        <textarea
          v-model="benefitForm.description"
          placeholder="Описание"
        ></textarea>
        <div class="two-col">
          <label
            >Регионы:
            <select
              v-model="benefitForm.regionIds"
              multiple
            >
              <option
                v-for="r in regions"
                :key="r.id"
                :value="r.id"
              >
                {{ r.name }}
              </option>
            </select>
          </label>
          <label
            >Категории:
            <select
              v-model="benefitForm.categoryIds"
              multiple
            >
              <option
                v-for="c in categories"
                :key="c.id"
                :value="c.id"
              >
                {{ c.title || c.name }}
              </option>
            </select>
          </label>
        </div>
        <button
          :disabled="loading.createBenefit"
          @click="handleCreateBenefit"
        >
          {{ loading.createBenefit ? 'Создание...' : 'Создать льготу' }}
        </button>
        <p
          v-if="errors.createBenefit"
          class="error"
        >
          {{ errors.createBenefit }}
        </p>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Период</th>
            <th>Категории</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="benefit in benefits"
            :key="benefit.id"
          >
            <td>{{ benefit.title }}</td>
            <td>{{ benefit.type }}</td>
            <td>
              {{ benefit.validFrom?.slice(0, 10) }} —
              {{ benefit.validTo?.slice(0, 10) }}
            </td>
            <td>
              <span
                class="badge"
                v-for="cat in benefit.benefitCategories || []"
                :key="cat.beneficiaryCategory.id"
              >
                {{
                  cat.beneficiaryCategory.title || cat.beneficiaryCategory.name
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="panel">
      <header class="panel__header">
        <div>
          <h2>Категории пользователей</h2>
          <p>Назначение/удаление BeneficiaryCategoryType.</p>
        </div>
      </header>
      <div class="form">
        <input
          v-model="userCategoryForm.userId"
          placeholder="User ID"
        />
        <select v-model="userCategoryForm.category">
          <option value="">Категория</option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.name"
          >
            {{ c.title || c.name }}
          </option>
        </select>
        <div class="actions">
          <button
            :disabled="loading.userCategory"
            @click="submitUserCategory('add')"
          >
            Добавить
          </button>
          <button
            :disabled="loading.userCategory"
            @click="submitUserCategory('remove')"
          >
            Удалить
          </button>
          <span class="muted">Требуется токен админа.</span>
        </div>
        <p class="muted">{{ userCategoryStatus }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}
.panel {
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 16px;
  color: #e2e8f0;
}
.panel__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.login input {
  margin-right: 8px;
  padding: 6px 8px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
.chips li {
  background: #111827;
  border: 1px solid #1f2937;
  padding: 6px 10px;
  border-radius: 10px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.form input,
.form select,
.form textarea {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #1f2937;
  background: #0b1020;
  color: #e2e8f0;
}
.form textarea {
  min-height: 80px;
}
.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  align-items: start;
}
button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  color: white;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  border: 1px solid #1f2937;
  padding: 8px;
}
.error {
  color: #f87171;
}
.badge {
  display: inline-block;
  background: #1f2937;
  padding: 4px 6px;
  border-radius: 6px;
  margin-right: 4px;
  margin-bottom: 4px;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.muted {
  color: #94a3b8;
}
</style>
