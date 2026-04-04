"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { DEFAULT_PRODUCT_IMAGE, normalizeImageUrl } from "@/src/shared/product-images"
import { cn } from "@/src/shared/utils"

type ProductImageProps = Omit<ImageProps, "src"> & {
  src?: string | null
}

export function ProductImage({ src, alt, className, ...props }: ProductImageProps) {
  const normalized = normalizeImageUrl(src)
  const [currentSrc, setCurrentSrc] = useState(normalized)

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      className={cn("object-contain object-center p-3", className)}
      onError={() => setCurrentSrc(DEFAULT_PRODUCT_IMAGE)}
    />
  )
}
