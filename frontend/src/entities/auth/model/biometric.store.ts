import { useUserStore } from '@entities/user';
import { biometricApi } from '../api/biometric';
import { useAuthStore } from './auth.store';
import { BiometricMeta } from '../types/webauthn.types';
import localForage from 'localforage';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import {
  assertionToJSON,
  attestationToJSON,
  isPlatformAuthenticatorAvailable,
  toCreationOptions,
  toRequestOptions
} from '@shared/lib/webauthn';

const STORAGE_KEY = 'biometric-login-meta';

export const useBiometricStore = defineStore('biometric', () => {
  const supported = ref<boolean | null>(null);
  const meta = ref<BiometricMeta | null>(null);
  const isProcessing = ref(false);
  const lastError = ref<string | null>(null);

  const authStore = useAuthStore();
  const userStore = useUserStore();

  const loadFromStorage = async () => {
    meta.value =
      (await localForage.getItem<BiometricMeta>(STORAGE_KEY)) || null;
  };

  const saveMeta = async (payload: BiometricMeta | null) => {
    meta.value = payload;
    if (payload) {
      await localForage.setItem(STORAGE_KEY, payload);
    } else {
      await localForage.removeItem(STORAGE_KEY);
    }
  };

  const ensureSupported = async () => {
    if (supported.value !== null) {
      return supported.value;
    }
    const available = await isPlatformAuthenticatorAvailable();
    supported.value = available;
    return available;
  };

  const enroll = async (phone: string, displayName: string) => {
    lastError.value = null;
    isProcessing.value = true;

    try {
      await loadFromStorage();
      const available = await ensureSupported();
      if (!available) {
        throw new Error('Биометрия на устройстве недоступна');
      }

      const optionsJSON = await biometricApi.getRegisterOptions();
      const options = toCreationOptions(optionsJSON);

      const credential = (await navigator.credentials.create({
        publicKey: options
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Настройка биометрии отменена');
      }

      const attestation = attestationToJSON(credential);
      await biometricApi.verifyRegister(attestation);
      await saveMeta({
        phone,
        displayName,
        credentialId: attestation.id
      });
      return true;
    } catch (error: any) {
      lastError.value =
        error?.message ?? 'Не удалось включить вход по биометрии';
      throw error;
    } finally {
      isProcessing.value = false;
    }
  };

  const loginWithBiometrics = async () => {
    lastError.value = null;
    isProcessing.value = true;
    try {
      await loadFromStorage();
      const available = await ensureSupported();
      if (!available) {
        throw new Error('Биометрия на устройстве недоступна');
      }

      if (!meta.value?.phone) {
        throw new Error('Нет сохраненного аккаунта для входа по биометрии');
      }

      const { options } = await biometricApi.getLoginOptions(meta.value.phone);
      const publicKey = toRequestOptions(options);

      const assertion = (await navigator.credentials.get({
        publicKey
      })) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error('Вход по биометрии отменен');
      }

      const assertionPayload = assertionToJSON(assertion);
      const auth = await biometricApi.verifyLogin(
        meta.value.phone,
        assertionPayload
      );

      await authStore.setAuth(auth);
      await userStore.getUser();
      return auth;
    } catch (error: any) {
      lastError.value = error?.message ?? 'Не удалось войти по биометрии';
      throw error;
    } finally {
      isProcessing.value = false;
    }
  };

  const disable = async () => {
    await saveMeta(null);
  };

  const rememberIdentity = async (phone: string, displayName?: string) => {
    await saveMeta({
      ...meta.value,
      phone,
      displayName
    });
  };

  const canLogin = computed(
    () => Boolean(meta.value?.phone) && supported.value !== false
  );

  return {
    supported,
    meta,
    isProcessing,
    lastError,
    loadFromStorage,
    ensureSupported,
    enroll,
    loginWithBiometrics,
    disable,
    rememberIdentity,
    canLogin
  };
});
