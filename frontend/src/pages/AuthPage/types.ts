import type { AuthLoginRequest } from '@entities/auth';
import type { FieldMetaData } from '@shared/types/formFieldMetaData';

export type AuthForm = {
  [K in keyof AuthLoginRequest]: FieldMetaData<string>;
};
