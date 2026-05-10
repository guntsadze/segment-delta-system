/*
  Warnings:

  - You are about to drop the column `added` on the `SegmentDelta` table. All the data in the column will be lost.
  - You are about to drop the column `removed` on the `SegmentDelta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SegmentDelta" DROP COLUMN "added",
DROP COLUMN "removed";

-- CreateTable
CREATE TABLE "DeltaAddition" (
    "id" TEXT NOT NULL,
    "deltaId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "DeltaAddition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeltaRemoval" (
    "id" TEXT NOT NULL,
    "deltaId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "DeltaRemoval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeltaAddition" ADD CONSTRAINT "DeltaAddition_deltaId_fkey" FOREIGN KEY ("deltaId") REFERENCES "SegmentDelta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeltaAddition" ADD CONSTRAINT "DeltaAddition_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeltaRemoval" ADD CONSTRAINT "DeltaRemoval_deltaId_fkey" FOREIGN KEY ("deltaId") REFERENCES "SegmentDelta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeltaRemoval" ADD CONSTRAINT "DeltaRemoval_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
