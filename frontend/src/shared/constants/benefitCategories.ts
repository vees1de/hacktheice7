export interface BenefitCategoryConfig {
  slug: string;
  name: string;
  icon: string;
  type: string;
  description?: string;
}

export const BENEFIT_CATEGORY_LIST: BenefitCategoryConfig[] = [
  {
    slug: 'transport',
    name: 'Транспорт',
    icon: 'bus',
    type: 'Транспорт',
    description: 'Льготы на городские и межрегиональные поездки'
  },
  {
    slug: 'medicine',
    name: 'Медицина',
    icon: 'heart',
    type: 'Медицина',
    description: 'Скидки на лекарства, лечение и медуслуги'
  },
  {
    slug: 'zhku',
    name: 'ЖКУ',
    icon: 'house',
    type: 'ЖКХ',
    description: 'Коммунальные платежи и компенсации за капремонт'
  },
  {
    slug: 'payments',
    name: 'Выплаты',
    icon: 'ruble',
    type: 'Выплаты',
    description: 'Денежные субсидии и компенсации'
  },
  {
    slug: 'taxes',
    name: 'Налоги',
    icon: 'bills',
    type: 'Налоги',
    description: 'Налоговые льготы и вычеты'
  },
  {
    slug: 'social',
    name: 'Социальные услуги',
    icon: 'users',
    type: 'Социальные услуги',
    description: 'Поддержка семей, сопровождение и уход'
  },
  {
    slug: 'work',
    name: 'Труд и обучение',
    icon: 'notebook',
    type: 'Труд и обучение',
    description: 'Трудовые льготы и программы переобучения'
  },
  {
    slug: 'regional',
    name: 'Региональные льготы',
    icon: 'cloud',
    type: 'Региональные льготы',
    description: 'Специальные программы вашего региона'
  }
];
