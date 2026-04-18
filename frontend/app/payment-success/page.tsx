"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate order confirmation retrieval
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 rounded bg-line" />
          <div className="h-10 w-32 rounded bg-line" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded border border-green-200 bg-green-50 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-6xl"
        >
          ✓
        </motion.div>

        <h1 className="text-3xl font-bold text-green-900">
          Payment Successful!
        </h1>

        <p className="mt-3 text-green-700">
          Your payment has been processed successfully. You will receive a
          confirmation email shortly.
        </p>

        {sessionId && (
          <p className="mt-2 text-sm text-green-600">
            Session ID: <span className="font-mono text-xs">{sessionId}</span>
          </p>
        )}

        <div className="mt-8 space-y-3">
          <Link
            href="/orders"
            className="block rounded bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
          >
            View My Orders
          </Link>

          <Link
            href="/products"
            className="block rounded border border-green-200 px-6 py-3 font-bold text-green-900 transition hover:bg-green-100"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-6 text-xs text-green-600">
          If you don't receive a confirmation email, please contact our support
          team.
        </p>
      </motion.div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 rounded bg-line" />
          <div className="h-10 w-32 rounded bg-line" />
        </div>
      </section>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
