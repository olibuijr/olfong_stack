CREATE TABLE "Lang" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Lang_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lang_key_key" ON "Lang"("key");