import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown } from "@/components/SortDropdown";
import { getProducts } from "@/lib/api";
import { aiSearchProducts } from "@/lib/ai";
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
  const aiSearch = query.search?.trim() ? await aiSearchProducts(query) : null;
  const products = aiSearch ?? (await getProducts(query));
  const isAllView = !query.category;
  const hasSearch = Boolean(query.search?.trim());
  const activeCategoryName =
    storefrontCategories.find((category) => category.slug === query.category)?.name ?? "Products";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-8">
        <p className="text-sm font-semibold uppercase text-teal">
          {hasSearch ? "Search results" : isAllView ? "Full marketplace" : activeCategoryName}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {hasSearch
            ? `Showing results for "${query.search}"`
            : isAllView
              ? "Discover Products Across All Categories"
              : `Shop ${activeCategoryName}`}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          {hasSearch
            ? "Search checks product names, descriptions, brands, and categories so partial and category-style queries feel natural."
            : isAllView
              ? "Explore a mixed catalog of standout finds from electronics, fashion, footwear, home and kitchen, beauty, sports and fitness, books, and accessories."
              : `Browse ${activeCategoryName.toLowerCase()} products with focused filtering, clean sorting, and consistent card layouts.`}
        </p>
        {hasSearch ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase text-ink/55">
            <span className="rounded border border-line bg-white px-3 py-2">
              Natural language search
            </span>
            <span className="rounded border border-line bg-white px-3 py-2">
              Category-aware search
            </span>
            <span className="rounded border border-line bg-white px-3 py-2">
              Multi-field search
            </span>
            {aiSearch?.intent.preferred_tags?.map((tag) => (
              <span key={tag} className="rounded border border-line bg-white px-3 py-2">
                {tag}
              </span>
            ))}
          </div>
        ) : isAllView ? (
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

      {aiSearch ? (
        <Reveal delay={0.11} className="mb-4 rounded border border-line bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold text-ink">AI understood: {aiSearch.explanation}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-ink/60">
            {aiSearch.intent.category ? (
              <span className="rounded bg-mist px-3 py-2">Category: {aiSearch.intent.category}</span>
            ) : null}
            {aiSearch.intent.use_case ? (
              <span className="rounded bg-mist px-3 py-2">Use case: {aiSearch.intent.use_case}</span>
            ) : null}
            {aiSearch.intent.budget_max !== null ? (
              <span className="rounded bg-mist px-3 py-2">Budget up to {aiSearch.intent.budget_max}</span>
            ) : null}
            {aiSearch.intent.audience ? (
              <span className="rounded bg-mist px-3 py-2">Audience: {aiSearch.intent.audience}</span>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      {hasSearch && products.pagination.totalItems === 0 ? (
        <Reveal delay={0.12} className="mb-6 rounded border border-dashed border-line bg-white px-6 py-8 text-center">
          <p className="text-lg font-bold text-ink">No products found</p>
          <p className="mt-2 text-sm text-ink/60">
            Try a different search like &quot;electronics&quot;, &quot;shoe&quot;, or &quot;serum&quot;.
          </p>
        </Reveal>
      ) : null}

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
