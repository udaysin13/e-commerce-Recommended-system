import ProductCard from "./ProductCard";

export default function RecommendationSection({ title, subtitle, products }) {
  if (!products?.length) {
    return null;
  }

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-700">{title}</span>
        </div>
        <p className="mt-4 max-w-3xl text-lg font-bold text-slate-900">{subtitle}</p>
      </div>

      {/* Products Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={`${title}-${product.id}`}
            product={product}
            caption={product.reason || "Recommended for you based on your activity."}
          />
        ))}
      </div>
    </section>
  );
}
