import type { Product } from "@/types/product";

const stableHash = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const rotate = <T>(items: T[], offset: number) => {
  if (items.length === 0) {
    return items;
  }

  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return items.slice(normalizedOffset).concat(items.slice(0, normalizedOffset));
};

export const dedupeProductsById = (products: Product[]) => {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
};

export const mixProductsAcrossCategories = (products: Product[]): Product[] => {
  const uniqueProducts = dedupeProductsById(products);

  if (uniqueProducts.length <= 2) {
    return uniqueProducts;
  }

  const grouped = new Map<string, Product[]>();

  for (const product of uniqueProducts) {
    const key = product.category.slug;
    const existing = grouped.get(key) ?? [];
    existing.push(product);
    grouped.set(key, existing);
  }

  const orderedCategories = Array.from(grouped.entries())
    .map(([slug, items]) => ({
      slug,
      items: items
        .slice()
        .sort((first, second) => stableHash(first.id) - stableHash(second.id)),
    }))
    .sort((first, second) => stableHash(first.slug) - stableHash(second.slug));

  const rotatedCategories = rotate(
    orderedCategories,
    stableHash(uniqueProducts.map((product) => product.id).join("|")),
  );

  const mixed: Product[] = [];
  const recentCategories: string[] = [];

  while (rotatedCategories.some((category) => category.items.length > 0)) {
    const nextCategory =
      rotatedCategories
        .filter((category) => category.items.length > 0)
        .sort((first, second) => {
          const firstPenalty =
            recentCategories[recentCategories.length - 1] === first.slug &&
            recentCategories[recentCategories.length - 2] === first.slug
              ? 1
              : 0;
          const secondPenalty =
            recentCategories[recentCategories.length - 1] === second.slug &&
            recentCategories[recentCategories.length - 2] === second.slug
              ? 1
              : 0;

          if (firstPenalty !== secondPenalty) {
            return firstPenalty - secondPenalty;
          }

          if (first.items.length !== second.items.length) {
            return second.items.length - first.items.length;
          }

          return stableHash(first.slug) - stableHash(second.slug);
        })[0];

    if (!nextCategory) {
      break;
    }

    const nextProduct = nextCategory.items.shift();

    if (!nextProduct) {
      continue;
    }

    mixed.push(nextProduct);
    recentCategories.push(nextCategory.slug);

    if (recentCategories.length > 2) {
      recentCategories.shift();
    }
  }

  return mixed;
};
