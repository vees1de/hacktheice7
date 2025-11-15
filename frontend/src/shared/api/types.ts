export type BeneficiaryCategoryType =
  | 'PENSIONER'
  | 'DISABLED_1'
  | 'DISABLED_2'
  | 'DISABLED_3'
  | 'MULTICHILD_PARENT'
  | 'VETERAN'
  | 'LOW_INCOME'
  | 'STUDENT'
  | 'DISABLED_CHILD_PARENT';

export interface Region {
  id: string;
  name: string;
  code: string;
  type?: string;
}

export interface BeneficiaryCategory {
  id: string;
  name: BeneficiaryCategoryType;
  title: string;
  icon?: string | null;
}

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
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'REJECTED' | 'BLOCKED';
  onboardingStep?: 'SMS_VERIFICATION' | 'ESIA_AUTH' | 'PROFILE_SETUP' | 'COMPLETE' | null;
  isVerified: boolean;
  isEsiaVerified: boolean;
  consentGiven?: boolean;
  consentDate?: string | null;
  userBeneficiaryCategories?: UserCategory[];
  commercialOffersAvailable?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSuccess {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface AuthRegisterRequest {
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  dateOfBirth: string;
  phone: string;
  snils: string;
  regionId: string;
}

export interface AuthLoginRequest {
  phone: string;
  password: string;
}

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

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  patronymic?: string | null;
  dateOfBirth?: string;
  phone?: string;
  snils?: string;
  regionId?: string;
  password?: string;
  userBeneficiaryCategories?: Array<{
    name: BeneficiaryCategoryType;
    confirmed: boolean;
  }>;
}
