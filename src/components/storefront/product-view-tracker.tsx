"use client"

import { useEffect } from "react"
import { pushRecentView } from "@/src/shared/personalization-storage"

type ProductViewTrackerProps = {
  productId: string
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    pushRecentView(productId)
  }, [productId])

  return null
}
