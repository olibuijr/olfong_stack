-- CreateTable
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" TEXT,
    "apiKey" TEXT,
    "secretKey" TEXT,
    "baseUrl" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "companyId" TEXT,
    "username" TEXT,
    "password" TEXT,
    "description" TEXT,
    "version" TEXT,
    "lastSync" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_name_key" ON "Integration"("name");

-- Update Setting category enum
ALTER TABLE "Setting" ALTER COLUMN "category" SET DEFAULT 'GENERAL';
















