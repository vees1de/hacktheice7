-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "phone" TEXT,
    "snils" VARCHAR(14),
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consent_date" TIMESTAMP(3),
    "region_id" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "beneficiary_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_beneficiary_category" (
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_date" TIMESTAMP(3),

    CONSTRAINT "user_beneficiary_category_pkey" PRIMARY KEY ("userId","categoryId")
);

-- CreateTable
CREATE TABLE "benefit" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "requirements" TEXT NOT NULL,
    "howToGet" TEXT NOT NULL,
    "source_url" TEXT,

    CONSTRAINT "benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_region" (
    "benefitId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "benefit_region_pkey" PRIMARY KEY ("benefitId","regionId")
);

-- CreateTable
CREATE TABLE "benefit_beneficiary_category" (
    "benefitId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "benefit_beneficiary_category_pkey" PRIMARY KEY ("benefitId","categoryId")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "partner_name" TEXT NOT NULL,
    "partner_logo" TEXT,
    "discount" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "terms" TEXT NOT NULL,
    "link" TEXT,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_region" (
    "offerId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "offer_region_pkey" PRIMARY KEY ("offerId","regionId")
);

-- CreateTable
CREATE TABLE "offer_beneficiary_category" (
    "offerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "offer_beneficiary_category_pkey" PRIMARY KEY ("offerId","categoryId")
);

-- CreateTable
CREATE TABLE "user_benefit_status" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "benefit_id" TEXT NOT NULL,

    CONSTRAINT "user_benefit_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hidden_benefit" (
    "userId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,

    CONSTRAINT "hidden_benefit_pkey" PRIMARY KEY ("userId","benefitId")
);

-- CreateTable
CREATE TABLE "saved_offer" (
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_offer_pkey" PRIMARY KEY ("userId","offerId")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notificationEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationPush" BOOLEAN NOT NULL DEFAULT true,
    "showExpired" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "interestedCategories" TEXT[],
    "preferredRegions" TEXT[],

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_token_token_key" ON "auth_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "region_name_key" ON "region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "region_code_key" ON "region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_category_name_key" ON "beneficiary_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_benefit_status_user_id_benefit_id_key" ON "user_benefit_status"("user_id", "benefit_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_user_id_key" ON "user_preference"("user_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_beneficiary_category" ADD CONSTRAINT "user_beneficiary_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_beneficiary_category" ADD CONSTRAINT "user_beneficiary_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "beneficiary_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_region" ADD CONSTRAINT "benefit_region_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_region" ADD CONSTRAINT "benefit_region_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_beneficiary_category" ADD CONSTRAINT "benefit_beneficiary_category_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_beneficiary_category" ADD CONSTRAINT "benefit_beneficiary_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "beneficiary_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_region" ADD CONSTRAINT "offer_region_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_region" ADD CONSTRAINT "offer_region_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_beneficiary_category" ADD CONSTRAINT "offer_beneficiary_category_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_beneficiary_category" ADD CONSTRAINT "offer_beneficiary_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "beneficiary_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_benefit_status" ADD CONSTRAINT "user_benefit_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_benefit_status" ADD CONSTRAINT "user_benefit_status_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hidden_benefit" ADD CONSTRAINT "hidden_benefit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hidden_benefit" ADD CONSTRAINT "hidden_benefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
