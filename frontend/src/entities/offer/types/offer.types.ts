import { BeneficiaryCategory } from '@entities/beneficiary';
import { Region } from '@entities/region';

export interface Offer {
  id: string;
  title: string;
  description?: string | null;
  partnerName: string;
  partnerLogo?: string | null;
  discount: string;
  validFrom: string;
  validTo: string;
  terms: string;
  link?: string | null;
  offerRegions?: Array<{ region: Region }>;
  offerCategories?: Array<{ beneficiaryCategory: BeneficiaryCategory }>;
}

export interface CreateOfferPayload {
  title: string;
  description?: string;
  partnerName: string;
  partnerLogo?: string;
  discount: string;
  validFrom: string;
  validTo: string;
  terms: string;
  link?: string;
  regionIds: string[];
  categoryIds: string[];
}
