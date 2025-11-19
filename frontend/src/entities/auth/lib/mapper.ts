import { AuthRegisterRequest } from '../types/auth.types';

export const toAuthRegisterDto = (form: AuthRegisterRequest) => {
  form.phone = '79' + form.phone;
  form.dateOfBirth = parseDateFromString(form.dateOfBirth).toISOString();

  return form;
};

function parseDateFromString(dateString: string) {
  // Проверяем, что строка имеет правильную длину
  if (dateString.length !== 8) {
    throw new Error('Строка должна содержать 8 символов в формате DDMMYYYY');
  }

  // Извлекаем компоненты даты
  const day = dateString.slice(0, 2);
  const month = dateString.slice(2, 4);
  const year = dateString.slice(4, 8);

  // Создаем объект Date (месяц в JavaScript начинается с 0, поэтому вычитаем 1)
  const date = new Date(`${year}-${month}-${day}`);

  // Проверяем, что дата валидна
  if (isNaN(date.getTime())) {
    throw new Error('Некорректная дата');
  }

  return date;
}

// Примеры использования:
console.log(parseDateFromString('11081999')); // 1999-08-11
console.log(parseDateFromString('01012023')); // 2023-01-01
console.log(parseDateFromString('31122020')); // 2020-12-31
