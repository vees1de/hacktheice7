import { apiRequest } from '../http.client';
import { BeneficiaryCategory } from '../types';

export const beneficiaryCategoryApi = {
  async getAll() {
    const { data } = await apiRequest<BeneficiaryCategory[]>('/beneficiary-categories', {
      method: 'GET'
    });
    return data;
  }
};
