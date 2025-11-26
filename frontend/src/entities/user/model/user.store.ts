import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { userApi } from '../api/user';
import { UserProfile } from '../types/user.types';

export const useUserStore = defineStore('user', () => {
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

  const setUser = (setUser: UserProfile) => {
    user.value = {
      ...user.value,
      ...setUser,
      userBeneficiaryCategories: setUser.userBeneficiaryCategories ?? []
    };
  };

  const getUser = async () => {
    const response = await userApi.getProfile();
    setUser(response.data);
  };

  const hasBenefits = computed(
    () => (user.value.userBeneficiaryCategories?.length ?? 0) > 0
  );

  return { setUser, user, getUser, hasBenefits };
});
