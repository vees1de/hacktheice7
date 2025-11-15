/*
  Warnings:

  - The values [ORPHAN] on the enum `BeneficiaryCategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BeneficiaryCategoryType_new" AS ENUM ('PENSIONER', 'DISABLED_1', 'DISABLED_2', 'DISABLED_3', 'MULTICHILD_PARENT', 'VETERAN', 'LOW_INCOME', 'STUDENT', 'DISABLED_CHILD_PARENT');
ALTER TABLE "beneficiary_category" ALTER COLUMN "name" TYPE "BeneficiaryCategoryType_new" USING ("name"::text::"BeneficiaryCategoryType_new");
ALTER TYPE "BeneficiaryCategoryType" RENAME TO "BeneficiaryCategoryType_old";
ALTER TYPE "BeneficiaryCategoryType_new" RENAME TO "BeneficiaryCategoryType";
DROP TYPE "public"."BeneficiaryCategoryType_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;
