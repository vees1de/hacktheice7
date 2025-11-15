/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[snils]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `beneficiary_category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `passwordHash` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `snils` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `date_of_birth` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('REGISTRATION_PENDING', 'PHONE_VERIFIED', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "BeneficiaryCategoryType" AS ENUM ('PENSIONER', 'DISABLED_1', 'DISABLED_2', 'DISABLED_3', 'MULTICHILD_PARENT', 'VETERAN', 'LOW_INCOME', 'STUDENT', 'ORPHAN');

-- AlterTable
ALTER TABLE "beneficiary_category" DROP COLUMN "name",
ADD COLUMN     "name" "BeneficiaryCategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'REGISTRATION_PENDING',
ADD COLUMN     "verificationCode" TEXT,
ALTER COLUMN "passwordHash" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "snils" SET NOT NULL,
ALTER COLUMN "date_of_birth" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_category_name_key" ON "beneficiary_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_snils_key" ON "user"("snils");
