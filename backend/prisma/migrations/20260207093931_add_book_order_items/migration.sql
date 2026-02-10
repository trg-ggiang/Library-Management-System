-- AlterTable
ALTER TABLE "Borrowing" ADD COLUMN     "orderId" INTEGER;

-- CreateTable
CREATE TABLE "BorrowOrder" (
    "id" SERIAL NOT NULL,
    "readerId" INTEGER NOT NULL,
    "loanDays" INTEGER NOT NULL DEFAULT 14,
    "note" TEXT,
    "pickupExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "paymentStatus" INTEGER NOT NULL DEFAULT 1,
    "totalDeposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalFee" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "BorrowOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowOrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BorrowOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER,
    "fineId" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(30) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "readerId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BorrowOrder_readerId_status_idx" ON "BorrowOrder"("readerId", "status");

-- CreateIndex
CREATE INDEX "BorrowOrder_createdAt_idx" ON "BorrowOrder"("createdAt");

-- CreateIndex
CREATE INDEX "BorrowOrderItem_bookId_idx" ON "BorrowOrderItem"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BorrowOrderItem_orderId_bookId_key" ON "BorrowOrderItem"("orderId", "bookId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_fineId_idx" ON "Payment"("fineId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Review_bookId_rating_idx" ON "Review"("bookId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_readerId_bookId_key" ON "Review"("readerId", "bookId");

-- AddForeignKey
ALTER TABLE "Borrowing" ADD CONSTRAINT "Borrowing_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BorrowOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowOrder" ADD CONSTRAINT "BorrowOrder_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ReaderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowOrderItem" ADD CONSTRAINT "BorrowOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BorrowOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowOrderItem" ADD CONSTRAINT "BorrowOrderItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BorrowOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_fineId_fkey" FOREIGN KEY ("fineId") REFERENCES "Fine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
