-- CreateTable
CREATE TABLE "ai_image_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_image_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_image_generations_userId_createdAt_idx" ON "ai_image_generations"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_image_generations" ADD CONSTRAINT "ai_image_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
