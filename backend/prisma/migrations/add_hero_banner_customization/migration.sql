-- AlterTable
ALTER TABLE "Banner" ADD COLUMN "isHero" BOOLEAN NOT NULL DEFAULT false;

-- Background Settings
ALTER TABLE "Banner" ADD COLUMN "backgroundType" TEXT NOT NULL DEFAULT 'gradient';
ALTER TABLE "Banner" ADD COLUMN "gradientStartColor" TEXT;
ALTER TABLE "Banner" ADD COLUMN "gradientEndColor" TEXT;
ALTER TABLE "Banner" ADD COLUMN "gradientDirection" TEXT NOT NULL DEFAULT 'to-r';
ALTER TABLE "Banner" ADD COLUMN "backgroundImageUrl" TEXT;
ALTER TABLE "Banner" ADD COLUMN "backgroundMediaId" TEXT;
ALTER TABLE "Banner" ADD COLUMN "backgroundOpacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- Marquee Settings
ALTER TABLE "Banner" ADD COLUMN "marqueeText" TEXT;
ALTER TABLE "Banner" ADD COLUMN "marqueeTextIs" TEXT;
ALTER TABLE "Banner" ADD COLUMN "marqueeSpeed" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Banner" ADD COLUMN "marqueeCount" INTEGER NOT NULL DEFAULT 3;

-- Hero Content Customization
ALTER TABLE "Banner" ADD COLUMN "heroLogoUrl" TEXT;
ALTER TABLE "Banner" ADD COLUMN "heroButtonText" TEXT;
ALTER TABLE "Banner" ADD COLUMN "heroButtonTextIs" TEXT;
ALTER TABLE "Banner" ADD COLUMN "heroButtonLink" TEXT;
ALTER TABLE "Banner" ADD COLUMN "heroSubtitle" TEXT;
ALTER TABLE "Banner" ADD COLUMN "heroSubtitleIs" TEXT;

-- Styling
ALTER TABLE "Banner" ADD COLUMN "textColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE "Banner" ADD COLUMN "buttonBgColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE "Banner" ADD COLUMN "buttonTextColor" TEXT NOT NULL DEFAULT '#1f2937';
ALTER TABLE "Banner" ADD COLUMN "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
