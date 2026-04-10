"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80";

export default function ProductImage({
  alt,
  className,
  height,
  priority = false,
  src,
  width,
}) {
  const [imageSrc, setImageSrc] = useState(
    typeof src === "string" && src.trim() ? src : FALLBACK_IMAGE
  );

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => {
        if (imageSrc !== FALLBACK_IMAGE) {
          setImageSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
