"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded border border-red-200 bg-red-50 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-6xl"
        >
          ✕
        </motion.div>

        <h1 className="text-3xl font-bold text-red-900">Payment Cancelled</h1>

        <p className="mt-3 text-red-700">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/products"
            className="block rounded bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Back to Shopping
          </Link>

          <Link
            href="/support"
            className="block rounded border border-red-200 px-6 py-3 font-bold text-red-900 transition hover:bg-red-100"
          >
            Contact Support
          </Link>
        </div>

        <p className="mt-6 text-xs text-red-600">
          If you encountered an issue, our support team is here to help.
        </p>
      </motion.div>
    </section>
  );
}
