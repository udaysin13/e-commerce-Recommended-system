"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { type AuthResponse } from "@/lib/auth";

export default function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const redirectTarget = useMemo(
    () => searchParams.get("redirect") || searchParams.get("returnUrl") || "/",
    [searchParams]
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Signup failed");
      }

      const data = (await response.json()) as AuthResponse;
      signup({
        user: data.data.user,
        token: data.data.token,
        message: `Account created successfully. Welcome, ${data.data.user.firstName || data.data.user.email}.`,
      });
      router.push(redirectTarget);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
      <div className="rounded border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-coral">Start shopping</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Create account</h1>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              First name
              <input
                type="text"
                required
                className="min-h-11 rounded border border-line px-4 outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
                placeholder="Ada"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isLoading}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Last name
              <input
                type="text"
                required
                className="min-h-11 rounded border border-line px-4 outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
                placeholder="Lovelace"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isLoading}
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Email
            <input
              type="email"
              required
              className="min-h-11 rounded border border-line px-4 outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
              placeholder="ada@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Password
            <input
              type="password"
              required
              className="min-h-11 rounded border border-line px-4 outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
              placeholder="Password123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
          </label>
          <button
            className="mt-2 rounded bg-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-sm text-ink/65">
          Already have an account?{" "}
          <Link className="font-bold text-teal" href="/login">
            Log in
          </Link>
        </p>
      </div>
      <div className="overflow-hidden rounded border border-line bg-white">
        <img
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
          alt="Calm workspace with shopping research"
          className="h-full min-h-[420px] w-full object-cover"
        />
      </div>
    </section>
  );
}
