-- AddDiscountFields
ALTER TABLE "Product" ADD COLUMN "hasDiscount" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "originalPrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "discountPercentage" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "discountStartDate" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "discountEndDate" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "discountReason" TEXT;
ALTER TABLE "Product" ADD COLUMN "discountReasonIs" TEXT;
