-- CreateTable
CREATE TABLE "registration_request" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "registration_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_request_phone_key" ON "registration_request"("phone");
