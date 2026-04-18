"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { type AuthResponse } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Login failed");
      }

      const data = (await response.json()) as AuthResponse;
      login({
        user: data.data.user,
        token: data.data.token,
        message: `Login successful. Welcome back, ${data.data.user.firstName || data.data.user.email}.`,
      });
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <div className="overflow-hidden rounded border border-line bg-white">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
          alt="Laptop with shopping dashboard"
          className="h-full min-h-[420px] w-full object-cover"
        />
      </div>
      <div className="rounded border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Log in</h1>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
            className="mt-2 rounded bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-teal disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Continue"}
          </button>
        </form>
        <p className="mt-5 text-sm text-ink/65">
          New here? <Link className="font-bold text-teal" href="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
