-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('CLIENT', 'MANAGER', 'ADMIN', 'PARTNER');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'CLIENT';
