import { Prisma } from '@prisma/client';

export type SafeUser = Omit<
  Prisma.UserGetPayload<{
    include: {
      region: true;
      staffProfile: true;
      userBeneficiaryCategories: {
        include: {
          beneficiaryCategory: true;
        };
      };
    };
  }>,
  'passwordHash' | 'verificationCode'
>;
