CREATE TABLE "ViewHistory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ViewHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ViewHistory_userId_viewedAt_idx" ON "ViewHistory"("userId", "viewedAt");
CREATE INDEX "ViewHistory_productId_viewedAt_idx" ON "ViewHistory"("productId", "viewedAt");

ALTER TABLE "ViewHistory"
ADD CONSTRAINT "ViewHistory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewHistory"
ADD CONSTRAINT "ViewHistory_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
