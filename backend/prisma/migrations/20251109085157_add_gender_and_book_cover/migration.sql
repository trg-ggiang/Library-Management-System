-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "coverUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "ReaderProfile" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'FEMALE';
