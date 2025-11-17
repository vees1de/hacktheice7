import { Benefit } from '@entities/benefit';
import { apiRequest } from '@shared/api';

import { UpdateUserPayload, UserProfile } from '../types/user.types';

export const userApi = {
  async getProfile() {
    const response = await apiRequest<UserProfile>('/user/me', {
      method: 'GET'
    });
    return response;
  },

  async updateProfile(payload: UpdateUserPayload) {
    const { data } = await apiRequest<UserProfile>('/user/profile', {
      method: 'PUT',
      data: payload
    });
    return data;
  },

  async getUserBenefits() {
    const { data } = await apiRequest<Benefit[]>('/user/benefits', {
      method: 'GET'
    });
    return data;
  },

  async getAvailableBenefits() {
    const { data } = await apiRequest<Benefit[]>('/user/benefits/available', {
      method: 'GET'
    });
    return data;
  },

  async updateUserCategories(categories: string[]) {
    const { data } = await apiRequest<UserProfile>('/user/beneficiary-categories', {
      method: 'PUT',
      data: { categories }
    });
    return data;
  }
};
