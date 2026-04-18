ALTER TABLE "products"
ADD COLUMN "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "cartCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "products_clickCount_idx" ON "products"("clickCount");
CREATE INDEX "products_cartCount_idx" ON "products"("cartCount");
