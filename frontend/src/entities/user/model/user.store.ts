import { defineStore } from 'pinia';
import { ref } from 'vue';

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

  return { setUser, user };
});
