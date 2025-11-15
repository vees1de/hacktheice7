import type { FieldMetaData } from '@shared/types/formFieldMetaData';
import { reactive, watch } from 'vue';

export function createForm<T extends Record<string, FieldMetaData<any>>>(
  template: T
) {
  const reactiveForm = reactive({ ...template }) as T;

  for (const fieldKey of Object.keys(reactiveForm)) {
    const validators = reactiveForm[fieldKey].validators;

    if (validators?.length) {
      watch(
        () => reactiveForm[fieldKey].value,
        newValue => {
          let hasError = false;
          for (let validator of validators) {
            if (!reactiveForm[fieldKey].disabled && !validator(newValue)) {
              hasError = true;
              break;
            }
          }
          reactiveForm[fieldKey].error = hasError;
        }
      );
    }
  }

  return {
    form: reactiveForm,
    getValue: () => {
      const raw = {};
      for (const [key, form] of Object.entries(reactiveForm)) {
        // @ts-ignore
        raw[key] = form.value;
      }
      return raw;
    },
    watchForm: (callback: (value: T) => void) => {
      return watch(() => reactiveForm, callback, {
        deep: true,
        immediate: true
      });
    }
  };
}
