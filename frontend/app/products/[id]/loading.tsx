export default function ProductDetailLoading() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="aspect-[4/3] animate-pulse rounded bg-line" />
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-line" />
        <div className="h-12 w-4/5 animate-pulse rounded bg-line" />
        <div className="h-24 w-full animate-pulse rounded bg-line" />
      </div>
    </section>
  );
}
