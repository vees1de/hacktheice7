import { BeneficiaryCategory } from '@entities/beneficiary';
import { Region } from '@entities/region';

export interface Benefit {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  validFrom: string;
  validTo: string;
  requirements: string;
  howToGet: string;
  sourceUrl?: string | null;
  benefitRegions?: Array<{ region: Region }>;
  benefitCategories?: Array<{ beneficiaryCategory: BeneficiaryCategory }>;
}

export interface CreateBenefitPayload {
  title: string;
  description?: string;
  type: string;
  validFrom: string;
  validTo: string;
  requirements: string;
  howToGet: string;
  sourceUrl?: string;
  regionIds: string[];
  categoryIds: string[];
}
