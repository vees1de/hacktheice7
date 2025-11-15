/*
  Warnings:

  - The values [REGISTRATION_PENDING,PHONE_VERIFIED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('SMS_VERIFICATION', 'ESIA_AUTH', 'PROFILE_SETUP', 'COMPLETE');

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED', 'BLOCKED');
ALTER TABLE "public"."user" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingStep" "OnboardingStep" DEFAULT 'SMS_VERIFICATION',
ALTER COLUMN "status" SET DEFAULT 'PENDING';
