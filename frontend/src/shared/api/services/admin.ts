import { apiRequest } from '../http.client';
import { BeneficiaryCategoryType, UserCategory } from '../types';

export const adminApi = {
  async addCategory(userId: string, category: BeneficiaryCategoryType) {
    const { data } = await apiRequest<UserCategory[]>('/admin/add-category', {
      method: 'POST',
      data: { userId, category }
    });
    return data;
  },

  async removeCategory(userId: string, category: BeneficiaryCategoryType) {
    const { data } = await apiRequest<UserCategory[]>('/admin/remove-category', {
      method: 'POST',
      data: { userId, category }
    });
    return data;
  },

  async assignCategories(userId: string, categories: BeneficiaryCategoryType[]) {
    const { data } = await apiRequest<UserCategory[]>('/admin/assign-categories', {
      method: 'POST',
      data: { userId, categories }
    });
    return data;
  }
};
