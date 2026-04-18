-- Align OrderStatus enum with the current schema and add order tracking fields/table

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED'
);

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "orders"
ALTER COLUMN "status" TYPE "OrderStatus"
USING (
  CASE
    WHEN "status"::text = 'PAID' THEN 'CONFIRMED'
    WHEN "status"::text = 'PROCESSING' THEN 'PACKED'
    WHEN "status"::text = 'REFUNDED' THEN 'RETURNED'
    ELSE "status"::text
  END
)::"OrderStatus";

ALTER TABLE "orders"
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "courierName" TEXT,
ADD COLUMN "estimatedDeliveryDate" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3);

DROP TYPE "OrderStatus_old";

CREATE TABLE "order_tracking_history" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "message" TEXT,
  "note" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "order_tracking_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_tracking_history_orderId_idx" ON "order_tracking_history"("orderId");
CREATE INDEX "order_tracking_history_createdAt_idx" ON "order_tracking_history"("createdAt");
CREATE INDEX "order_tracking_history_status_idx" ON "order_tracking_history"("status");

ALTER TABLE "order_tracking_history"
ADD CONSTRAINT "order_tracking_history_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
