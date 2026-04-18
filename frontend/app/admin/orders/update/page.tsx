"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type UpdateOrderState = "idle" | "loading" | "success" | "error";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export default function AdminUpdateOrderPage() {
  const router = useRouter();
  const [state, setState] = useState<UpdateOrderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orderId: "",
    status: "CONFIRMED",
    message: "",
    note: "",
    trackingNumber: "",
    courierName: "",
    estimatedDeliveryDate: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Not authenticated");
      }

      if (!formData.orderId.trim()) {
        throw new Error("Order ID is required");
      }

      const requestBody: any = {
        status: formData.status,
      };

      if (formData.message) requestBody.message = formData.message;
      if (formData.note) requestBody.note = formData.note;
      if (formData.trackingNumber) requestBody.trackingNumber = formData.trackingNumber;
      if (formData.courierName) requestBody.courierName = formData.courierName;
      if (formData.estimatedDeliveryDate) {
        requestBody.estimatedDeliveryDate = new Date(formData.estimatedDeliveryDate).toISOString();
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/order-tracking/admin/${formData.orderId.trim()}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update order");
      }

      const data = await response.json();
      setState("success");
      setSuccessMessage(`Order status updated to ${formData.status}`);

      // Reset form
      setTimeout(() => {
        setFormData({
          orderId: "",
          status: "CONFIRMED",
          message: "",
          note: "",
          trackingNumber: "",
          courierName: "",
          estimatedDeliveryDate: "",
        });
        setState("idle");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
      setState("error");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex text-sm font-bold text-teal hover:text-ink"
      >
        ← Back
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Update Order Status</h1>
        <p className="mt-2 text-sm text-ink/65">
          Update order status and add tracking information
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded border border-line bg-white p-6 shadow-sm"
      >
        {/* Order ID */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-ink">
            Order ID <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            onChange={handleInputChange}
            placeholder="e.g., ord_abc123"
            disabled={state === "loading"}
            className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
            required
          />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-ink">
            New Status <span className="text-red-600">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={state === "loading"}
            className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-ink">
            Status Message (optional)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="e.g., Order confirmed and sent to warehouse"
            disabled={state === "loading"}
            rows={3}
            className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
          />
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-ink">
            Internal Note (optional)
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="e.g., Delayed due to high volume"
            disabled={state === "loading"}
            rows={2}
            className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
          />
        </div>

        {/* Tracking Information */}
        <div className="mb-6 rounded border border-dashed border-line bg-mist p-4">
          <h3 className="mb-4 font-bold text-ink">Tracking Information (optional)</h3>

          <div className="mb-4">
            <label className="block text-sm font-bold text-ink">
              Tracking Number
            </label>
            <input
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleInputChange}
              placeholder="e.g., 1Z999AA10123456784"
              disabled={state === "loading"}
              className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-ink">
              Courier Name
            </label>
            <input
              type="text"
              name="courierName"
              value={formData.courierName}
              onChange={handleInputChange}
              placeholder="e.g., FedEx, DHL, UPS"
              disabled={state === "loading"}
              className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              name="estimatedDeliveryDate"
              value={formData.estimatedDeliveryDate}
              onChange={handleInputChange}
              disabled={state === "loading"}
              className="mt-2 w-full rounded border border-line px-4 py-2 outline-none focus:border-teal disabled:bg-mist"
            />
          </div>
        </div>

        {/* Error Message */}
        {state === "error" && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {state === "success" && successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded border border-green-200 bg-green-50 p-4"
          >
            <p className="text-sm text-green-700">✓ {successMessage}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={state === "loading"}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1 rounded bg-teal px-4 py-3 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "loading" ? "Updating..." : "Update Order Status"}
          </motion.button>
          <Link
            href="/admin"
            className="rounded border border-line px-4 py-3 text-center font-bold text-ink transition hover:border-teal hover:text-teal"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </section>
  );
}
