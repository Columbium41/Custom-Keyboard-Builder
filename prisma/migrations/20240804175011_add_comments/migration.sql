-- CreateTable
CREATE TABLE "Comment" (
    "userId" INTEGER NOT NULL,
    "buildId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_userId_buildId_key" ON "Comment"("userId", "buildId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("build_id") ON DELETE CASCADE ON UPDATE CASCADE;
