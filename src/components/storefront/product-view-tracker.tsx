"use client"

import { useEffect } from "react"
import { pushRecentView } from "@/src/shared/personalization-storage"

type ProductViewTrackerProps = {
  productId: string
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    pushRecentView(productId)
    void fetch("/api/interactions/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => null)
  }, [productId])

  return null
}
