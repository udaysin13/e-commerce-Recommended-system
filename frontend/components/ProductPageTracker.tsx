"use client";

import { useEffect } from "react";
import { trackProductViewEvent } from "@/lib/productEvents";

export const ProductPageTracker = ({ productId }: { productId: string }) => {
  useEffect(() => {
    void trackProductViewEvent(productId);
  }, [productId]);

  return null;
};
