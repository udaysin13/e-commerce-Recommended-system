"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type BuyNowButtonProps = {
  productId: string;
  quantity?: number;
};

export const BuyNowButton = ({ productId, quantity = 1 }: BuyNowButtonProps) => {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async () => {
    setIsProcessing(true);
    try {
      // Redirect to checkout page with product and quantity
      router.push(`/checkout?productId=${productId}&quantity=${quantity}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.button
      onClick={handleBuyNow}
      disabled={isProcessing}
      whileHover={reducedMotion ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      className="flex-1 rounded bg-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
      type="button"
    >
      {isProcessing ? "Processing..." : "Buy Now"}
    </motion.button>
  );
};
