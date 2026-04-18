"use client";

const features = [
  {
    title: "Fast delivery",
    description: "Free shipping on selected products and quick dispatch on best sellers.",
  },
  {
    title: "Secure checkout",
    description: "Protected payments with order and cart APIs wired to the backend.",
  },
  {
    title: "Easy returns",
    description: "Simple product discovery with clear pricing and availability.",
  },
  {
    title: "Smart picks",
    description: "Hybrid recommendations help shoppers find better products faster.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-950">ShopWise promise</h2>
        <p className="text-sm text-slate-600">The essentials shoppers expect from a marketplace</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-bold text-slate-950">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
