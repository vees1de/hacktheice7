import { apiRequest } from '@shared/api';

import { BeneficiaryCategory } from '../types/beneficiary.types';

export const beneficiaryCategoryApi = {
  async getAll() {
    const { data } = await apiRequest<BeneficiaryCategory[]>(
      '/beneficiary-categories',
      {
        method: 'GET'
      }
    );
    return data;
  }
};
