import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const router = useRouter();

  const authorize = () => {
    localStorage.setItem('bims-token', 'token');
    isAuthenticated.value = true;
    router.push('/account');
  };

  const handleAuthentication = () => {
    if (localStorage.getItem('bims-token')) {
      return true;
    } else {
      return false;
    }
  };

  return { isAuthenticated, authorize, handleAuthentication };
});
