"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
};

export const AddToCartButton = ({ productId, quantity = 1 }: AddToCartButtonProps) => {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleAddToCart = async () => {
    setState("loading");
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setState("error");
        setMessage("Please login to add items to cart");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to add to cart");
      }

      setState("success");
      setMessage("Added to cart!");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to add to cart");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div>
      <motion.button
        onClick={handleAddToCart}
        disabled={state === "loading"}
        whileHover={reducedMotion ? undefined : { y: -2, scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        className={`flex-1 rounded border px-5 py-3 text-sm font-bold transition sm:flex-none ${
          state === "success"
            ? "border-green-500 bg-green-50 text-green-700"
            : state === "error"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-teal text-teal hover:bg-teal/5"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        type="button"
      >
        {state === "loading" ? "Adding..." : state === "success" ? "Added!" : "Add to cart"}
      </motion.button>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-2 text-xs ${state === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};
