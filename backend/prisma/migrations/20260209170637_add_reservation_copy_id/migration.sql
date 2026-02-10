/*
  Warnings:

  - You are about to drop the column `bookCopyId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservedAt` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `copyId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Made the column `expiresAt` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_bookCopyId_fkey";

-- DropIndex
DROP INDEX "Reservation_readerId_bookId_status_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "bookCopyId",
DROP COLUMN "reservedAt",
ADD COLUMN     "copyId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Reservation_readerId_status_idx" ON "Reservation"("readerId", "status");

-- CreateIndex
CREATE INDEX "Reservation_copyId_status_idx" ON "Reservation"("copyId", "status");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
