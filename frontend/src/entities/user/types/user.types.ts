import {
  BeneficiaryCategory,
  BeneficiaryCategoryType
} from '@entities/beneficiary';
import { Region } from '@entities/region';

export interface UserCategory {
  userId: string;
  categoryId: string;
  confirmed: boolean;
  confirmationDate?: string | null;
  beneficiaryCategory: BeneficiaryCategory;
}

export interface UserProfile {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  dateOfBirth: string;
  phone: string;
  snils: string;
  regionId: string;
  region?: Region;
  status:
    | 'PENDING'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'REJECTED'
    | 'BLOCKED';
  onboardingStep?:
    | 'SMS_VERIFICATION'
    | 'ESIA_AUTH'
    | 'PROFILE_SETUP'
    | 'COMPLETE'
    | null;
  isVerified: boolean;
  isEsiaVerified: boolean;
  consentGiven?: boolean;
  consentDate?: string | null;
  userBeneficiaryCategories?: UserCategory[];
  commercialOffersAvailable?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  patronymic?: string | null;
  dateOfBirth?: string;
  phone?: string;
  snils?: string;
  regionId?: string;
  password?: string;
  onboardingStep?: UserProfile['onboardingStep'];
  userBeneficiaryCategories?: Array<{
    name: BeneficiaryCategoryType;
    confirmed: boolean;
  }>;
}
