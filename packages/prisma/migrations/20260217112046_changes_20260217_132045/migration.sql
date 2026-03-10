-- DropIndex
DROP INDEX "tokens_userId_type_key";

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_userId_type_clientId_key" ON "tokens"("userId", "type", "clientId");
