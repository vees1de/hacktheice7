import { defineStore } from 'pinia';
import { ref } from 'vue';

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
    isEsiaVerified: false
  });

  const setUser = (setUser: UserProfile) => {
    user.value = setUser;
  };

  const getUser = async () => {
    const response = await userApi.getProfile();
    setUser(response.data);
  };

  return { setUser, user, getUser };
});
