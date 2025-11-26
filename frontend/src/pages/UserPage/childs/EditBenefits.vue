<script lang="ts" setup>
import { useUserStore, userApi } from '@entities/user';
import { useViewStore } from '@shared/stores/view.store';
import { Button } from '@shared/ui';
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const viewStore = useViewStore();
const userStore = useUserStore();

const BENEFIT_CATEGORIES = reactive([
  { value: 'PENSIONER', label: 'Пенсионер', isSelected: false },
  { value: 'DISABLED_1', label: 'Инвалид I группы', isSelected: false },
  { value: 'DISABLED_2', label: 'Инвалид II группы', isSelected: false },
  { value: 'DISABLED_3', label: 'Инвалид III группы', isSelected: false },
  {
    value: 'MULTICHILD_PARENT',
    label: 'Многодетный родитель',
    isSelected: false
  },
  { value: 'VETERAN', label: 'Ветеран', isSelected: false },
  { value: 'LOW_INCOME', label: 'Малоимущий', isSelected: false },
  { value: 'STUDENT', label: 'Студент', isSelected: false },
  {
    value: 'DISABLED_CHILD_PARENT',
    label: 'Родитель ребенка-инвалида',
    isSelected: false
  }
]);

const onSelect = (index: number) => {
  BENEFIT_CATEGORIES[index].isSelected = !BENEFIT_CATEGORIES[index].isSelected;
};

const submit = async () => {
  viewStore.toggleLoader();
  const selectedBenefits = BENEFIT_CATEGORIES.map(benefit => {
    if (benefit.isSelected) {
      return benefit.value;
    }
    return '';
  }).filter(benefit => !!benefit);

  try {
    if (selectedBenefits.length) {
      const profile = await userApi.updateUserCategories(selectedBenefits);
      userStore.setUser(profile);
    }
    if (selectedBenefits.length === 0) {
      const profile = await userApi.updateUserCategories([]);
      userStore.setUser(profile);
    }
  } catch (error) {
  } finally {
    viewStore.toggleLoader();
    await router.back();
  }
};

onMounted(() => {
  const current = userStore.user.userBeneficiaryCategories ?? [];
  current.forEach(category => {
    const idx = BENEFIT_CATEGORIES.findIndex(
      c => c.value === category.beneficiaryCategory.name
    );
    if (idx !== -1) {
      BENEFIT_CATEGORIES[idx].isSelected = true;
    }
  });
});
</script>
<template>
  <div class="edit-benefits">
    <div class="checkbox-list">
      <template
        v-for="(category, index) in BENEFIT_CATEGORIES"
        :key="category.value"
      >
        <div class="item">
          <span>{{ category.label }}</span
          ><span
            @click="onSelect(index)"
            class="checkbox-circle"
            :class="category.isSelected ? 'filled' : 'empty'"
          ></span>
        </div>
        <div class="line"></div>
      </template>
    </div>
    <Button
      class="submit"
      @click="submit"
      >Подтвердить по госуслугам</Button
    >
  </div>
</template>
<style lang="scss" scoped>
.line {
  width: 80%;
  margin: auto;
  height: 2px;
  background-color: #d9d9d9;
}

.checkbox-list {
  display: grid;
  gap: 16px;
  margin-bottom: 80px;
  margin-top: 24px;
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.checkbox-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: inline-block;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-circle.filled {
  background-color: #007bff;
  border-color: #007bff;
}

.checkbox-circle.filled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

.checkbox-circle.empty {
  background-color: transparent;
  border-color: #ccc;
}

/* Hover эффекты */
.checkbox-circle.empty:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.checkbox-circle.filled:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
