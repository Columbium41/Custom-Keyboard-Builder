/*
  Warnings:

  - You are about to drop the column `filepath` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `fileURL` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Made the column `mimetype` on table `Photo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `Photo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "filepath",
ADD COLUMN     "fileURL" TEXT NOT NULL,
ALTER COLUMN "mimetype" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL;
