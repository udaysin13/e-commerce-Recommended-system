ALTER TABLE "Product" RENAME COLUMN "image" TO "imageUrl";

ALTER TABLE "Product"
ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product"
SET
  "imageUrl" = COALESCE(NULLIF("imageUrl", ''), '/placeholder.jpg'),
  "images" = CASE
    WHEN "imageUrl" IS NOT NULL AND "imageUrl" <> '' THEN ARRAY["imageUrl"]
    ELSE ARRAY[]::TEXT[]
  END;
