import { apiRequest } from '@shared/api';

import { Benefit, CreateBenefitPayload } from '../types/benefit.types';

export const benefitApi = {
  async getAll() {
    const { data } = await apiRequest<Benefit[]>('/benefits', {
      method: 'GET'
    });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiRequest<Benefit>(`/benefits/${id}`, {
      method: 'GET'
    });
    return data;
  },

  async create(payload: CreateBenefitPayload) {
    const { data } = await apiRequest<Benefit>('/benefits', {
      method: 'POST',
      data: payload
    });
    return data;
  },

  async update(id: string, payload: Partial<CreateBenefitPayload>) {
    const { data } = await apiRequest<Benefit>(`/benefits/${id}`, {
      method: 'PUT',
      data: payload
    });
    return data;
  },

  async remove(id: string) {
    const { data } = await apiRequest<{ id: string }>(`/benefits/${id}`, {
      method: 'DELETE'
    });
    return data;
  }
};
