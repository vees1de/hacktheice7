import { apiRequest } from '../http.client';
import { Benefit, UpdateUserPayload, UserProfile } from '../types';

export const userApi = {
  async getProfile() {
    const { data } = await apiRequest<UserProfile>('/user/me', { method: 'GET' });
    return data;
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
  }
};
