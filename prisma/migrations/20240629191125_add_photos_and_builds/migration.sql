-- CreateTable
CREATE TABLE "Build" (
    "build_id" SERIAL NOT NULL,
    "kit" VARCHAR(255) NOT NULL,
    "case" VARCHAR(255) NOT NULL,
    "pcb" VARCHAR(255) NOT NULL,
    "plate" VARCHAR(255) NOT NULL,
    "switches" VARCHAR(255) NOT NULL,
    "keycaps" VARCHAR(255) NOT NULL,
    "mods" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("build_id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "photo_id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "mimetype" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buildId" INTEGER,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("photo_id")
);

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("build_id") ON DELETE SET NULL ON UPDATE CASCADE;
