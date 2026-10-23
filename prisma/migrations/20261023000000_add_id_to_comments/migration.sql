-- DropIndex
DROP INDEX "Comment_userId_buildId_key";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "comment_id" SERIAL NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id");

-- CreateIndex
CREATE INDEX "Comment_buildId_idx" ON "Comment"("buildId");

