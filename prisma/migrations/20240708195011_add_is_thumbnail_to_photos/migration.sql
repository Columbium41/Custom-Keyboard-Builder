-- AlterTable
ALTER TABLE "Build" ALTER COLUMN "kit" SET DEFAULT '',
ALTER COLUMN "case" SET DEFAULT '',
ALTER COLUMN "pcb" SET DEFAULT '',
ALTER COLUMN "plate" SET DEFAULT '',
ALTER COLUMN "switches" SET DEFAULT '',
ALTER COLUMN "keycaps" SET DEFAULT '',
ALTER COLUMN "mods" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "isThumbnail" BOOLEAN NOT NULL DEFAULT false;
