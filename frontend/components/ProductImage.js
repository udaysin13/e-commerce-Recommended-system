"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_IMAGE =
  "/product-images/headphones.svg";

const realProductImage = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=900`;

const LEGACY_IMAGE_FALLBACKS = {
  "photo-1505740420928-5e560c06d30e": realProductImage("Bose QuietComfort 35 II Wireless Headphones.jpg"),
  "photo-1580519504369-acb61989127c": realProductImage("USB Type-C Cable - iPad USB-C Charger (45640822114).jpg"),
  "photo-1523275335684-37898b6baf30": realProductImage("Smart Watch.jpg"),
  "photo-1598545889f5-73d1b46fbfeb": realProductImage("Webcam.JPG"),
  "photo-1521572163474-6864f9cf17ab": realProductImage("FairtradeCertifiedCottonTShirt.jpg"),
  "photo-1542272604-787c62d465d1": realProductImage("Denimjeans.JPG"),
  "photo-1551028719-00167b16ebc5": realProductImage("WinterWear2011.JPG"),
  "photo-1610701596007-11502861dcfa": realProductImage("A set of knives.jpg"),
  "photo-1565636192335-14c46fa1200b": realProductImage("Retro desk lamp.jpg"),
  "photo-1548693267-2bc61f0b16c2": realProductImage("Hotel Pillow and Bedding (39935420303).jpg"),
  "photo-1556228578-8c89e6adf883": realProductImage("SansZit moisturizing anti-acne cream.jpg"),
  "photo-1556430306-1f02b3d5e5ed": realProductImage("SansZit moisturizing anti-acne cream.jpg"),
  "photo-1511707171634-5f897ff02aa9": realProductImage("Mobile phone.jpg"),
  "photo-1512499617640-c2f99981b6b5": realProductImage("Android smartphones.jpg"),
  "photo-1511367461989-f85a21fda167": realProductImage("Bose QuietComfort 35 II Wireless Headphones.jpg"),
  "photo-1562158070-7013134d5d41": realProductImage("Sneaker.jpg"),
  "photo-1601004890684-d8cbf643f5f2": realProductImage("Air Fryer 5458.jpg"),
  "photo-1544716278-ca5e3af4abd8": realProductImage("Atomic habits.jpg"),
  "photo-1589080876629-53c1f4de5e9f": realProductImage("Yoga mat.jpg"),
};

function getSafeImageSrc(src) {
  if (typeof src !== "string" || !src.trim()) {
    return FALLBACK_IMAGE;
  }

  const legacyMatch = Object.entries(LEGACY_IMAGE_FALLBACKS).find(([photoId]) =>
    src.includes(photoId)
  );

  return legacyMatch ? legacyMatch[1] : src;
}

function shouldSkipImageOptimization(src) {
  return (
    typeof src === "string" &&
    (src.startsWith("https://commons.wikimedia.org") ||
      src.startsWith("https://upload.wikimedia.org") ||
      src.startsWith("https://images.unsplash.com"))
  );
}

export default function ProductImage({
  alt,
  className,
  height,
  onError,
  onLoad,
  priority = false,
  src,
  width,
}) {
  const [imageSrc, setImageSrc] = useState(getSafeImageSrc(src));

  useEffect(() => {
    setImageSrc(getSafeImageSrc(src));
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={shouldSkipImageOptimization(imageSrc)}
      priority={priority}
      onError={(event) => {
        if (imageSrc !== FALLBACK_IMAGE) {
          setImageSrc(FALLBACK_IMAGE);
          return;
        }
        onError?.(event);
      }}
      onLoad={onLoad}
    />
  );
}
