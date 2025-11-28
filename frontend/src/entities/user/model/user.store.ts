import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { userApi } from '../api/user';
import { UserProfile } from '../types/user.types';

export const useUserStore = defineStore('user', () => {
  const getCategoriesSignature = (
    categories?: UserProfile['userBeneficiaryCategories']
  ) =>
    (categories ?? [])
      .map(category => `${category.categoryId}:${category.confirmed ? 1 : 0}`)
      .sort()
      .join('|');

  const user = ref<UserProfile>({
    lastName: 'Пермяков',
    id: '',
    firstName: '',
    dateOfBirth: '',
    phone: '',
    snils: '',
    regionId: '',
    status: 'PENDING',
    isVerified: false,
    isEsiaVerified: false,
    userBeneficiaryCategories: []
  });
  const benefitsVersion = ref(0);
  const hasCategoriesSnapshot = ref(false);
  const categoriesSignature = ref(
    getCategoriesSignature(user.value.userBeneficiaryCategories)
  );

  const setUser = (setUser: UserProfile) => {
    const nextCategories = setUser.userBeneficiaryCategories ?? [];
    const nextSignature = getCategoriesSignature(nextCategories);
    const shouldUpdateVersion =
      hasCategoriesSnapshot.value &&
      nextSignature !== categoriesSignature.value;

    user.value = {
      ...user.value,
      ...setUser,
      userBeneficiaryCategories: nextCategories
    };

    if (shouldUpdateVersion) {
      benefitsVersion.value += 1;
    }

    categoriesSignature.value = nextSignature;
    hasCategoriesSnapshot.value = true;
  };

  const getUser = async () => {
    const response = await userApi.getProfile();
    setUser(response.data);
  };

  const hasBenefits = computed(
    () => (user.value.userBeneficiaryCategories?.length ?? 0) > 0
  );

  return { setUser, user, getUser, hasBenefits, benefitsVersion };
});
