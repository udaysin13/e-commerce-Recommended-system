"use client";

import ProductImage from "./ProductImage";

const categoryDetails = {
  Electronics: {
    imageUrl: "/product-images/headphones.svg",
    offer: "Gadgets and accessories",
  },
  Fashion: {
    imageUrl: "/product-images/tshirt.svg",
    offer: "Styles under Rs. 999",
  },
  Home: {
    imageUrl: "/product-images/desk-lamp.svg",
    offer: "Kitchen and decor",
  },
  Beauty: {
    imageUrl: "/product-images/face-serum.svg",
    offer: "Skin care deals",
  },
};

export default function CategoryGrid({ categories, onCategorySelect, activeCategory }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Shop by category</h2>
          <p className="text-sm text-slate-600">Quick access to popular departments</p>
        </div>
        {activeCategory ? (
          <button
            type="button"
            onClick={() => onCategorySelect(activeCategory)}
            className="rounded border border-slate-200 px-3 py-2 text-xs font-bold text-[#2874f0]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((category) => {
          const details = categoryDetails[category] || categoryDetails.Electronics;
          return (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              type="button"
              className={`rounded-lg border p-3 text-left transition hover:border-[#2874f0] ${
                activeCategory === category
                  ? "border-[#2874f0] bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <ProductImage
                src={details.imageUrl}
                alt={category}
                width={220}
                height={150}
                className="h-24 w-full rounded bg-slate-100 object-cover"
              />
              <h3 className="mt-3 text-sm font-bold text-slate-950">{category}</h3>
              <p className="mt-1 text-xs font-semibold text-green-700">{details.offer}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
