import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase text-coral">Not found</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">This page is not available</h1>
      <p className="mt-3 text-ink/65">The product or page may have moved.</p>
      <Link href="/products" className="mt-7 inline-flex rounded bg-teal px-5 py-3 text-sm font-bold text-white">
        Browse products
      </Link>
    </section>
  );
}
