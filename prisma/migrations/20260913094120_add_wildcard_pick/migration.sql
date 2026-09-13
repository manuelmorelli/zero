-- CreateTable
CREATE TABLE "wildcard_picks" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "pickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wildcard_picks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wildcard_picks_category_key" ON "wildcard_picks"("category");

-- AddForeignKey
ALTER TABLE "wildcard_picks" ADD CONSTRAINT "wildcard_picks_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
