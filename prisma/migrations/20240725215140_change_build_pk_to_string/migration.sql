/*
  Warnings:

  - The primary key for the `Build` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_buildId_fkey";

-- AlterTable
ALTER TABLE "Build" DROP CONSTRAINT "Build_pkey",
ALTER COLUMN "build_id" DROP DEFAULT,
ALTER COLUMN "build_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Build_pkey" PRIMARY KEY ("build_id");
DROP SEQUENCE "Build_build_id_seq";

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "buildId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("build_id") ON DELETE CASCADE ON UPDATE CASCADE;
