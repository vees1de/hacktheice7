export const onlyString = () => {
  return (value: any): boolean => {
    if (value) {
      const regex = /^[a-zA-Zа-яА-ЯёЁ]+$/;
      return regex.exec(value) !== null;
    } else {
      return true;
    }
  };
};

export const required = () => {
  return (value: any): boolean => {
    return !!value;
  };
};

export const date = () => {
  return (dateString: any): boolean => {
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
      return false;
    } else {
      return true;
    }
  };
};

export const maxSymbols = (max: number) => {
  return (value: string | null): boolean => {
    value = value ? value : '';

    if (value.length >= max) {
      return false;
    } else {
      return true;
    }
  };
};

export const minSymbols = (min: number) => {
  return (value: string | null): boolean => {
    value = value ? value : '';
    if (value.length <= min) {
      return false;
    } else {
      return true;
    }
  };
};
