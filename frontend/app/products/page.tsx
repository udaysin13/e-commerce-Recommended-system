import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown } from "@/components/SortDropdown";
import { getProducts } from "@/lib/api";
import { storefrontCategories } from "@/lib/categories";
import type { ProductListParams } from "@/types/product";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getFirst = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : value;
};

const buildPageHref = (
  params: Record<string, string | string[] | undefined>,
  nextPage: number,
) => {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalized = getFirst(value);
    if (normalized !== undefined && normalized !== "") {
      nextParams.set(key, normalized);
    }
  });

  nextParams.set("page", String(nextPage));

  return `/products?${nextParams.toString()}`;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query: ProductListParams = {
    page: Number(getFirst(params.page) ?? 1),
    limit: Number(getFirst(params.limit) ?? 12),
    search: getFirst(params.search),
    category: getFirst(params.category),
    sortBy: (getFirst(params.sortBy) as ProductListParams["sortBy"]) ?? "newest",
    sortOrder: (getFirst(params.sortOrder) as ProductListParams["sortOrder"]) ?? "desc",
  };
  const products = await getProducts(query);
  const isAllView = !query.category;
  const activeCategoryName =
    storefrontCategories.find((category) => category.slug === query.category)?.name ?? "Products";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-8">
        <p className="text-sm font-semibold uppercase text-teal">
          {isAllView ? "Full marketplace" : activeCategoryName}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {isAllView ? "Discover Products Across All Categories" : `Shop ${activeCategoryName}`}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          {isAllView
            ? "Explore a mixed catalog of standout finds from electronics, fashion, footwear, home and kitchen, beauty, sports and fitness, books, and accessories."
            : `Browse ${activeCategoryName.toLowerCase()} products with focused filtering, clean sorting, and consistent card layouts.`}
        </p>
        {isAllView ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase text-ink/55">
            {storefrontCategories.map((category) => (
              <span key={category.id} className="rounded border border-line bg-white px-3 py-2">
                {category.name}
              </span>
            ))}
          </div>
        ) : null}
      </Reveal>

      <Reveal delay={0.06} className="mb-6">
        <div className="grid gap-4 rounded border border-line bg-white p-4 shadow-sm">
        <SearchBar />
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <CategoryFilter />
          <SortDropdown />
        </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mb-4 flex items-center justify-between text-sm text-ink/60">
        <span>{products.pagination.totalItems} products</span>
        <span>
          Page {products.pagination.page} of {Math.max(products.pagination.totalPages, 1)}
        </span>
      </Reveal>

      <ProductGrid
        products={products.items}
        animationKey={[
          query.category ?? "all",
          query.search ?? "",
          query.sortBy ?? "newest",
          query.sortOrder ?? "desc",
          products.pagination.page,
        ].join(":")}
      />

      <Reveal delay={0.14} className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        <div>
          {products.pagination.hasPreviousPage ? (
            <Link
              href={buildPageHref(params, products.pagination.page - 1)}
              className="inline-flex rounded border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal"
            >
              Previous
            </Link>
          ) : (
            <span className="inline-flex rounded border border-line/60 px-4 py-2 text-sm font-semibold text-ink/35">
              Previous
            </span>
          )}
        </div>

        <span className="text-sm font-semibold text-ink/60">
          Page {products.pagination.page} of {Math.max(products.pagination.totalPages, 1)}
        </span>

        <div>
          {products.pagination.hasNextPage ? (
            <Link
              href={buildPageHref(params, products.pagination.page + 1)}
              className="inline-flex rounded bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
            >
              Next
            </Link>
          ) : (
            <span className="inline-flex rounded bg-line px-4 py-2 text-sm font-semibold text-ink/35">
              Next
            </span>
          )}
        </div>
      </Reveal>
    </section>
  );
}
