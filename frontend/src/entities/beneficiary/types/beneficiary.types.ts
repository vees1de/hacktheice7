export interface BeneficiaryCategory {
  id: string;
  name: BeneficiaryCategoryType;
  title: string;
  icon?: string | null;
}

export type BeneficiaryCategoryType =
  | 'PENSIONER'
  | 'DISABLED_1'
  | 'DISABLED_2'
  | 'DISABLED_3'
  | 'MULTICHILD_PARENT'
  | 'VETERAN'
  | 'LOW_INCOME'
  | 'STUDENT'
  | 'DISABLED_CHILD_PARENT';
