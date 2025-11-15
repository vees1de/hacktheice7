export interface FieldMetaData<T = any> {
  value: T;
  validators?: ((val: T) => boolean)[];
  error?: boolean;
  disabled?: boolean;
}
