import { apiRequest } from '@shared/api';

export const shareTokenApi = {
  async create() {
    const { data } = await apiRequest<{ token: string; expiresAt: string }>(
      '/auth/share-token',
      {
        method: 'POST'
      }
    );
    return data;
  }
};
