export type LossItem = {
  id: string;
  title: string;
  type: string;
  monthlyLoss: number;
  yearlyLoss: number;
};

export type UserLossResult = {
  userId: string;
  categories: string[];
  lossItems: LossItem[];
  totalLossMonthly: number;
  totalLossYearly: number;
};
