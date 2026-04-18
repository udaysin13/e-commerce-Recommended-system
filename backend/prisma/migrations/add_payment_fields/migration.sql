-- AddColumn paymentMethod, paymentId, transactionId, paidAt to Order
-- CreateEnum PaymentMethod if not exists
-- Add unique constraints for payment fields

-- Add the enum type (PostgreSQL)
CREATE TYPE "PaymentMethod" AS ENUM ('RAZORPAY', 'STRIPE', 'MANUAL');

-- Alter the orders table to add new columns
ALTER TABLE "orders" ADD COLUMN "paymentMethod" "PaymentMethod",
ADD COLUMN "paymentId" TEXT,
ADD COLUMN "transactionId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- Create unique indexes for payment fields
CREATE UNIQUE INDEX "orders_paymentId_key" ON "orders"("paymentId");
CREATE UNIQUE INDEX "orders_transactionId_key" ON "orders"("transactionId");
CREATE INDEX "orders_paymentId_idx" ON "orders"("paymentId");
CREATE INDEX "orders_transactionId_idx" ON "orders"("transactionId");
