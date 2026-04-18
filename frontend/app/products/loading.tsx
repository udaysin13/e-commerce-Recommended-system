import { LoadingState } from "@/components/LoadingState";

export default function ProductsLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-28 animate-pulse rounded bg-line" />
      <LoadingState />
    </section>
  );
}
