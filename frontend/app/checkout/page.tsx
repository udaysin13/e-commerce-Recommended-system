"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckoutAddressForm } from "@/components/CheckoutAddressForm";
import { useAuth } from "@/components/AuthProvider";
import { API_BASE_URL } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getProductById } from "@/lib/api";
import type { Cart } from "@/types/cart";
import type { CheckoutAddress } from "@/types/order";
import type { Product } from "@/types/product";

type CheckoutMode = "buy-now" | "cart";
type CheckoutState = "loading" | "ready" | "submitting" | "error";
type PaymentChoice = "direct" | "razorpay";
type AddressErrors = Partial<Record<keyof CheckoutAddress, string>>;

type RazorpayOrderResponse = {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKey: string;
  };
};

type CartApiResponse = {
  success: boolean;
  data?: {
    cart?: Cart;
  };
};

const ADDRESS_STORAGE_KEY = "checkoutAddressDraft";

const emptyAddress: CheckoutAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, showToast } = useAuth();
  const productId = searchParams.get("productId");
  const initialQuantity = Number(searchParams.get("quantity") || 1);
  const mode: CheckoutMode = productId ? "buy-now" : "cart";

  const [pageState, setPageState] = useState<CheckoutState>("loading");
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("direct");
  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    const nextAddress = raw ? ({ ...emptyAddress, ...(JSON.parse(raw) as Partial<CheckoutAddress>) }) : emptyAddress;

    if (user) {
      const guessedName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
      if (guessedName && !nextAddress.fullName) {
        nextAddress.fullName = guessedName;
      }
    }

    setAddress(nextAddress);
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = `/checkout${productId ? `?productId=${productId}&quantity=${quantity}` : ""}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, productId, quantity, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadCheckoutData = async () => {
      try {
        setError(null);
        setPageState("loading");

        if (mode === "buy-now") {
          if (!productId) {
            throw new Error("No product selected for checkout.");
          }

          const loadedProduct = await getProductById(productId);

          if (!loadedProduct) {
            throw new Error("Product not found.");
          }

          setProduct(loadedProduct);
          setQuantity(Math.max(1, Math.min(initialQuantity, loadedProduct.stockQuantity)));
          setPageState("ready");
          return;
        }

        const token = window.localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication required.");
        }

        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load cart.");
        }

        const json = (await response.json()) as CartApiResponse;
        setCart(json.data?.cart ?? null);
        setPageState("ready");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load checkout.");
        setPageState("error");
      }
    };

    void loadCheckoutData();
  }, [initialQuantity, isAuthenticated, mode, productId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateAddress = () => {
    const nextErrors: AddressErrors = {};

    if (!address.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!address.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9()\-\s]{7,20}$/.test(address.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!address.addressLine1.trim()) nextErrors.addressLine1 = "Address line 1 is required.";
    if (!address.city.trim()) nextErrors.city = "City is required.";
    if (!address.state.trim()) nextErrors.state = "State is required.";
    if (!address.postalCode.trim()) {
      nextErrors.postalCode = "Postal code is required.";
    } else if (!/^[A-Za-z0-9 -]{4,12}$/.test(address.postalCode.trim())) {
      nextErrors.postalCode = "Enter a valid postal code.";
    }
    if (!address.country.trim()) nextErrors.country = "Country is required.";

    setAddressErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddressChange = (field: keyof CheckoutAddress, value: string) => {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));

    setAddressErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const checkoutItems = useMemo(() => {
    if (mode === "buy-now" && product) {
      const subtotal = Number(product.price) * quantity;
      const tax = subtotal * 0.1;
      return {
        items: [
          {
            id: product.id,
            name: product.name,
            description: product.shortDescription ?? product.description ?? "",
            imageUrl:
              product.imageUrl ??
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
            quantity,
            unitPrice: Number(product.price),
            totalPrice: subtotal + tax,
            category: product.category.name,
            currency: product.currency,
          },
        ],
        subtotal,
        tax,
        total: subtotal + tax,
        currency: product.currency,
      };
    }

    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;
    const tax = 0;
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.product.name,
        description: item.product.brand ?? "",
        imageUrl:
          item.product.imageUrl ??
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.lineTotal,
        category: item.product.category.name,
        currency: item.product.currency,
      })),
      subtotal,
      tax,
      total: subtotal,
      currency: items[0]?.product.currency ?? "USD",
    };
  }, [cart, mode, product, quantity]);

  const handleDirectPlaceOrder = async () => {
    if (!validateAddress()) {
      setError("Please complete the delivery address before placing the order.");
      return;
    }

    const token = window.localStorage.getItem("authToken");
    if (!token) {
      const returnUrl = `/checkout${productId ? `?productId=${productId}&quantity=${quantity}` : ""}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setPageState("submitting");
      setError(null);

      const endpoint = mode === "buy-now" ? `${API_BASE_URL}/orders/buy-now` : `${API_BASE_URL}/orders`;
      const body =
        mode === "buy-now"
          ? {
              productId: product?.id,
              quantity,
              ...address,
            }
          : address;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to place order.");
      }

      showToast("Order placed successfully.", "success");
      router.push(`/order-confirmation/${json.data.order.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Checkout failed.");
      setPageState("error");
    }
  };

  const handleRazorpayPayment = async () => {
    if (!product) return;

    if (!validateAddress()) {
      setError("Please complete the delivery address before continuing to payment.");
      return;
    }

    const token = window.localStorage.getItem("authToken");
    if (!token) {
      const returnUrl = `/checkout?productId=${product.id}&quantity=${quantity}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setPageState("submitting");
      setError(null);

      const createOrderResponse = await fetch(`${API_BASE_URL}/payments/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          userEmail: user?.email ?? "customer@example.com",
          userPhone: address.phone,
        }),
      });

      const orderData = (await createOrderResponse.json()) as RazorpayOrderResponse & {
        error?: { message?: string };
      };

      if (!createOrderResponse.ok) {
        throw new Error(orderData.error?.message || "Failed to create payment order.");
      }

      const { orderId, amount, currency, razorpayKey } = orderData.data;

      if (typeof window === "undefined" || !("Razorpay" in window)) {
        throw new Error("Razorpay is not available right now.");
      }

      const RazorpayConstructor = (window as unknown as Window & {
        Razorpay: new (options: Record<string, unknown>) => {
          on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
          open: () => void;
        };
      }).Razorpay;

      const razorpay = new RazorpayConstructor({
        key: razorpayKey,
        amount,
        currency,
        order_id: orderId,
        prefill: {
          name: address.fullName,
          email: user?.email ?? "customer@example.com",
          contact: address.phone,
        },
        theme: {
          color: "#0ea5a5",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/payments/razorpay/verify?productId=${product.id}&quantity=${quantity}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                ...address,
              }),
            });

            const verifyJson = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyJson.error?.message || "Payment verification failed.");
            }

            showToast("Payment successful. Your order is confirmed.", "success");
            router.push(`/order-confirmation/${verifyJson.data.orderId}`);
          } catch (verifyError) {
            setError(
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed. Please try again.",
            );
            setPageState("ready");
          }
        },
      });

      razorpay.on("payment.failed", (response: { error: { description: string } }) => {
        setError(response.error.description || "Payment failed. Please try again.");
        setPageState("ready");
      });

      razorpay.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment failed.");
      setPageState("error");
    }
  };

  if (authLoading || pageState === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-line" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-[520px] rounded bg-line" />
            <div className="h-[520px] rounded bg-line" />
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (pageState === "error" && !checkoutItems.items.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-900">Unable to load checkout</h1>
          <p className="mt-2 text-sm text-red-700">{error ?? "Please try again."}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
            <Link
              href={mode === "buy-now" && productId ? `/products/${productId}` : "/cart"}
              className="rounded border border-line px-4 py-2 text-sm font-bold text-ink transition hover:border-teal hover:text-teal"
            >
              Go back
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (mode === "cart" && checkoutItems.items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-bold text-ink">Your cart is empty.</p>
          <p className="mt-2 text-sm text-ink/65">Add products before moving to checkout.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded bg-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  const submitting = pageState === "submitting";

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={mode === "buy-now" && productId ? `/products/${productId}` : "/cart"}
        className="mb-6 inline-flex text-sm font-bold text-teal transition hover:text-ink"
      >
        Back to {mode === "buy-now" ? "product" : "cart"}
      </Link>

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-teal">
          {mode === "buy-now" ? "Buy now checkout" : "Cart checkout"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Confirm delivery and place your order</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          Orders cannot be placed until a valid delivery address is provided.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Checkout issue</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded border border-line bg-white p-6 shadow-sm"
        >
          <CheckoutAddressForm
            address={address}
            errors={addressErrors}
            onChange={handleAddressChange}
            disabled={submitting}
          />
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Order summary</h2>
            <div className="mt-5 space-y-4">
              {checkoutItems.items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-teal">{item.category}</p>
                    <p className="mt-1 font-bold text-ink">{item.name}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-ink/60">{item.description}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-ink/65">
                      Quantity: {item.quantity} x {formatCurrency(item.unitPrice, item.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/65">Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatCurrency(checkoutItems.subtotal, checkoutItems.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Tax</span>
                <span className="font-semibold text-ink">
                  {checkoutItems.tax === 0
                    ? "Calculated in total"
                    : formatCurrency(checkoutItems.tax, checkoutItems.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-lg font-bold text-ink">Total</span>
              <span className="text-2xl font-bold text-teal">
                {formatCurrency(checkoutItems.total, checkoutItems.currency)}
              </span>
            </div>
          </div>

          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Delivery preview</h2>
            <div className="mt-4 rounded bg-mist px-4 py-4 text-sm text-ink/75">
              <p className="font-bold text-ink">{address.fullName || "Full Name"}</p>
              <p className="mt-1">{address.phone || "Phone Number"}</p>
              <p className="mt-3">{address.addressLine1 || "Address Line 1"}</p>
              {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
              <p>
                {[address.city || "City", address.state || "State"].join(", ")} {address.postalCode || "PIN"}
              </p>
              <p>{address.country || "Country"}</p>
            </div>

            {mode === "buy-now" ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-ink">Payment method</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("direct")}
                    className={`rounded border px-4 py-3 text-sm font-bold transition ${
                      paymentChoice === "direct"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-line text-ink hover:border-teal hover:text-teal"
                    }`}
                  >
                    Place Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChoice("razorpay")}
                    className={`rounded border px-4 py-3 text-sm font-bold transition ${
                      paymentChoice === "razorpay"
                        ? "border-teal bg-teal/5 text-teal"
                        : "border-line text-ink hover:border-teal hover:text-teal"
                    }`}
                  >
                    Razorpay
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={paymentChoice === "razorpay" ? handleRazorpayPayment : handleDirectPlaceOrder}
                disabled={submitting}
                className="w-full rounded bg-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? mode === "buy-now" && paymentChoice === "razorpay"
                    ? "Starting payment..."
                    : "Placing order..."
                  : mode === "buy-now" && paymentChoice === "razorpay"
                    ? "Pay and confirm order"
                    : "Place Order"}
              </button>
              <Link
                href={mode === "buy-now" && productId ? `/products/${productId}` : "/cart"}
                className="block rounded border border-line px-5 py-3 text-center text-sm font-bold text-ink transition hover:border-teal hover:text-teal"
              >
                Cancel
              </Link>
            </div>

            <p className="mt-4 text-xs text-ink/55">
              Your address draft is saved in this browser so you can refresh and continue.
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-line" />
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="h-[520px] rounded bg-line" />
              <div className="h-[520px] rounded bg-line" />
            </div>
          </div>
        </section>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
