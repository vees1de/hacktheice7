import { apiRequest } from '../http.client';
import { Region } from '../types';

export const regionApi = {
  async getAll() {
    const { data } = await apiRequest<Region[]>('/regions', { method: 'GET' });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiRequest<Region>(`/regions/${id}`, {
      method: 'GET'
    });
    return data;
  }
};
