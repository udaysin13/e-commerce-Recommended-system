import Link from "next/link";
import { storefrontCategories } from "@/lib/categories";

export const Footer = () => {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-ink/70 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-base font-bold text-ink">RecomCart</p>
          <p className="mt-3 max-w-sm">
            Thoughtful shopping flows powered by product data, behavior signals, and clear recommendations.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">Shop</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {storefrontCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded border border-line px-2 py-1 transition hover:border-teal hover:text-teal"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink">Project</p>
          <p className="mt-3">Next.js, TypeScript, Tailwind, Express, Prisma, and PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
};
