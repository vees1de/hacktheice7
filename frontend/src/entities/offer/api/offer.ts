import { apiRequest } from '@shared/api';

import { CreateOfferPayload, Offer } from '../types/offer.types';

export const offerApi = {
  async getAll() {
    const { data } = await apiRequest<Offer[]>('/offers', { method: 'GET' });
    return data;
  },

  async getPublic() {
    const { data } = await apiRequest<Offer[]>('/offers/public', {
      method: 'GET'
    });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiRequest<Offer>(`/offers/${id}`, {
      method: 'GET'
    });
    return data;
  },

  async create(payload: CreateOfferPayload) {
    const { data } = await apiRequest<Offer>('/offers', {
      method: 'POST',
      data: payload
    });
    return data;
  },

  async update(id: string, payload: Partial<CreateOfferPayload>) {
    const { data } = await apiRequest<Offer>(`/offers/${id}`, {
      method: 'PUT',
      data: payload
    });
    return data;
  },

  async remove(id: string) {
    const { data } = await apiRequest<{ id: string }>(`/offers/${id}`, {
      method: 'DELETE'
    });
    return data;
  }
};
