<template>Account</template>

<!-- <script setup lang="ts">
import { beneficiaryCategoryApi } from '@entities/beneficiary/api/beneficiaryCategory';
import type {
  BeneficiaryCategory,
  BeneficiaryCategoryType
} from '@entities/beneficiary/types/beneficiary.types';
import { type UserProfile, userApi } from '@entities/user';
import { Block, Button } from '@shared/ui';
import { computed, onMounted, ref } from 'vue';

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const categories = ref<BeneficiaryCategory[]>([]);
const profile = ref<UserProfile | null>(null);
const selected = ref<Set<BeneficiaryCategoryType>>(new Set());

const isEsiaVerified = computed(() => Boolean(profile.value?.isEsiaVerified));
const selectedCount = computed(() => selected.value.size);

const fetchData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [cats, user] = await Promise.all([
      beneficiaryCategoryApi.getAll(),
      userApi.getProfile()
    ]);
    categories.value = cats;
    profile.value = user;
    selected.value = new Set(
      (user.userBeneficiaryCategories || []).map(
        ({ beneficiaryCategory }) => beneficiaryCategory.name
      )
    );
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || 'Не удалось загрузить данные профиля';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const toggleCategory = (name: BeneficiaryCategoryType) => {
  success.value = '';
  if (selected.value.has(name)) {
    selected.value.delete(name);
    selected.value = new Set(selected.value);
  } else {
    selected.value = new Set([...selected.value, name]);
  }
};

const clearCategories = () => {
  selected.value = new Set();
  success.value = '';
};

const saveCategories = async () => {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const updated = await userApi.updateUserCategories([
      ...selected.value.values()
    ]);
    profile.value = updated as UserProfile;
    selected.value = new Set(
      (updated.userBeneficiaryCategories || []).map(
        ({ beneficiaryCategory }) => beneficiaryCategory.name
      )
    );
    success.value =
      selected.value.size > 0
        ? 'Льготы сохранены, статус Госуслуг подтвержден.'
        : 'Все льготы очищены, подтверждение Госуслуг снято.';
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ||
      'Не удалось сохранить выбор льгот. Попробуйте снова.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="account">
    <div class="status-bar">
      <div
        class="badge"
        :class="{
          'badge--success': isEsiaVerified,
          'badge--warning': !isEsiaVerified
        }"
      >
        <span
          class="dot"
          :class="{
            'dot--green': isEsiaVerified,
            'dot--yellow': !isEsiaVerified
          }"
        />
        {{
          isEsiaVerified
            ? 'Госуслуги подтверждены'
            : 'Госуслуги не подтверждены'
        }}
      </div>
      <div class="badge">Выбрано льгот: {{ selectedCount }}</div>
    </div>

    <Block class="card">
      <div class="card__header">
        <div>
          <p class="card__title">Ваши льготы</p>
          <p class="card__subtitle">
            Отметьте категории, чтобы активировать льготы и статус на
            Госуслугах. Пустой список снимет подтверждение.
          </p>
        </div>
        <Button
          kind="secondary"
          @click="clearCategories"
          >Очистить выбор</Button
        >
      </div>

      <div
        v-if="loading"
        class="status"
      >
        Загрузка данных...
      </div>
      <div v-else>
        <div
          v-if="error"
          class="status status--error"
        >
          {{ error }}
        </div>
        <div class="grid">
          <label
            v-for="category in categories"
            :key="category.id"
            class="category"
            :class="{ 'category--active': selected.has(category.name) }"
          >
            <input
              type="checkbox"
              :checked="selected.has(category.name)"
              @change="toggleCategory(category.name)"
            />
            <div>
              <p class="category__title">{{ category.title }}</p>
              <p class="category__code">{{ category.name }}</p>
            </div>
          </label>
        </div>

        <div class="actions">
          <Button
            :loading="saving"
            :disabled="saving"
            @click="saveCategories"
          >
            Сохранить льготы
          </Button>
          <span class="hint">Изменения вступают в силу сразу.</span>
        </div>

        <div
          v-if="success"
          class="status status--success"
        >
          {{ success }}
        </div>
      </div>
    </Block>
  </div>
</template>

<style scoped lang="scss">
.account {
  display: grid;
  gap: 16px;
}

.status-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  background: #f8fafc;
  color: #0f172a;
}

.badge--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}
.badge--warning {
  border-color: #fef08a;
  background: #fffbeb;
  color: #92400e;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f59e0b;
}

.dot--green {
  background: #22c55e;
}
.dot--yellow {
  background: #f59e0b;
}

.card {
  display: grid;
  gap: 12px;
}

.card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  .btn {
    width: auto;
  }
}

.card__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.card__subtitle {
  margin: 4px 0 0;
  color: #475569;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.category {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  transition:
    border 0.2s ease,
    box-shadow 0.2s ease;

  input {
    margin-top: 4px;
  }
}

.category--active {
  border-color: #2563eb;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.1);
}

.category__title {
  margin: 0;
  font-weight: 700;
}
.category__code {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.status {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.status--error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #b91c1c;
}

.status--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;

  .btn {
    width: auto;
  }
}

.hint {
  color: #64748b;
  font-size: 14px;
}
</style> -->
