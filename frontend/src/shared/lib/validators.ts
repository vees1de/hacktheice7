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

export const maxSymbols = (max: number) => {
  return (value: string | null): boolean => {
    value = value ? value : '';

    if (value.length <= max) {
      return true;
    } else {
      return false;
    }
  };
};
