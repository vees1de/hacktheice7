import { apiRequest } from '@shared/api';
import { UserLossResult } from '../types/loss.types';

export const lossApi = {
  async getUserLoss() {
    const { data } = await apiRequest<UserLossResult>('/me/loss', {
      method: 'GET'
    });
    return data;
  }
};
