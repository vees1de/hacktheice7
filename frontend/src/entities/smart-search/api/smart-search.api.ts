import { apiRequest } from '@shared/api';

export interface SmartSearchItem {
  id: string;
  title: string;
  categories: string[];
  type: string;
  valid_to: string;
  howToGet: string;
  requirements: string;
  source_url?: string;
  score?: number;
}

export interface SmartSearchResponse {
  ok?: boolean;
  answer_final?: string;
  answer_ru?: string;
  detected_lang?: string;
  items?: SmartSearchItem[];
}

export const smartSearchApi = {
  async search(query: string) {
    const { data } = await apiRequest<SmartSearchResponse>(
      '/smart-search/benefits',
      {
        method: 'POST',
        data: { query }
      }
    );
    return data;
  }
};
