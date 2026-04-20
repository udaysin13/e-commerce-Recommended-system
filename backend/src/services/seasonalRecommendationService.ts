import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  RecommendationBadge,
  RecommendationItem,
  RecommendationProduct,
  RecommendationScore,
  SeasonalFestival,
  SeasonalRecommendationResponse,
  SeasonalRecommendationSection,
} from "../types/recommendation.js";

const FESTIVAL_LOOKAHEAD_DAYS = 10;
const MANUAL_FESTIVAL_OVERRIDE: string | null = null;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  currency: true,
  stockQuantity: true,
  imageUrl: true,
  averageRating: true,
  ratingCount: true,
  viewCount: true,
  clickCount: true,
  cartCount: true,
  purchaseCount: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

type ProductForRecommendation = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

type SectionConfig = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
  categories: string[];
  keywords: string[];
  reason: string;
};

const emptyScore: RecommendationScore = {
  content: 0,
  collaborative: 0,
  popularity: 0,
  hybrid: 0,
};

const toNumber = (value: { toString(): string } | null | undefined): number => {
  if (!value) return 0;
  return Number(value.toString());
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const mapProduct = (product: ProductForRecommendation): RecommendationProduct => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  price: toNumber(product.price),
  currency: product.currency,
  stockQuantity: product.stockQuantity,
  imageUrl: product.imageUrl,
  averageRating: toNumber(product.averageRating),
  ratingCount: product.ratingCount,
  viewCount: product.viewCount,
  clickCount: product.clickCount,
  cartCount: product.cartCount,
  purchaseCount: product.purchaseCount,
  category: product.category,
});

const getPopularityBadges = (product: ProductForRecommendation): RecommendationBadge[] => {
  const badges: RecommendationBadge[] = [];
  const rating = toNumber(product.averageRating);

  if (product.purchaseCount >= 140) badges.push("Best Seller");
  if (product.viewCount >= 1200 || product.clickCount >= 420) badges.push("Trending");
  if (product.purchaseCount >= 90 && rating >= 4.3) badges.push("Popular in this category");
  if (product.viewCount >= 900) badges.push("Frequently Viewed");
  if (rating >= 4.6 && product.ratingCount >= 100) badges.push("Top Rated");

  return badges;
};

const festivalCalendar = [
  {
    id: "new-year",
    name: "New Year",
    icon: "\u2728",
    date: "2026-01-01",
    tagline: "Fresh-start picks for a new year of shopping.",
    saleLabel: "New Year countdown",
  },
  {
    id: "holi",
    name: "Holi",
    icon: "\uD83C\uDF89",
    date: "2026-03-04",
    tagline: "Bright, playful picks for gifting and festive prep.",
    saleLabel: "Holi specials",
  },
  {
    id: "eid-al-fitr",
    name: "Eid",
    icon: "\uD83C\uDF19",
    date: "2026-03-20",
    tagline: "Curated gifting, self-care, and hosting picks for Eid.",
    saleLabel: "Eid is coming soon",
  },
  {
    id: "eid-al-adha",
    name: "Eid al-Adha",
    icon: "\uD83C\uDF19",
    date: "2026-05-27",
    tagline: "Meaningful picks for gifting and family gatherings.",
    saleLabel: "Festival edit",
  },
  {
    id: "diwali",
    name: "Diwali",
    icon: "\uD83E\uDE94",
    date: "2026-11-08",
    tagline: "Gifting, hosting, and celebration-ready picks for Diwali.",
    saleLabel: "Diwali deals",
  },
  {
    id: "christmas",
    name: "Christmas",
    icon: "\uD83C\uDF84",
    date: "2026-12-25",
    tagline: "Gift-friendly picks for festive winter shopping.",
    saleLabel: "Christmas countdown",
  },
] as const;

const seasonConfigs: Array<{
  id: "summer" | "rainy" | "festival-season" | "winter";
  label: string;
  months: number[];
  section: SectionConfig;
}> = [
  {
    id: "summer",
    label: "Summer",
    months: [2, 3, 4],
    section: {
      id: "summer-picks",
      title: "Summer Picks",
      eyebrow: "Seasonal edit",
      description: "Light, active, and easy-to-carry picks that fit warm-weather shopping.",
      icon: "\uD83D\uDD25",
      categories: ["fashion", "sports-fitness", "beauty", "accessories", "footwear"],
      keywords: ["runner", "serum", "sport", "light", "open-ear", "recovery"],
      reason: "Chosen for warm-weather comfort, movement, and lighter daily carry.",
    },
  },
  {
    id: "rainy",
    label: "Rainy",
    months: [5, 6, 7, 8],
    section: {
      id: "rainy-essentials",
      title: "Rainy Season Essentials",
      eyebrow: "Weather-aware picks",
      description: "Durable, commute-friendly, and all-day comfort picks for wet-season routines.",
      icon: "\uD83C\uDF27",
      categories: ["footwear", "accessories", "electronics", "home-kitchen"],
      keywords: ["wool", "runner", "power", "bag", "carry", "portable"],
      reason: "Picked for rainy-day commuting, portability, and everyday resilience.",
    },
  },
  {
    id: "festival-season",
    label: "Festival Season",
    months: [9, 10],
    section: {
      id: "festival-specials",
      title: "Festival Specials",
      eyebrow: "Celebration-ready",
      description: "Giftable, host-friendly, and polished picks for seasonal celebrations.",
      icon: "\uD83C\uDF89",
      categories: ["fashion", "beauty", "accessories", "home-kitchen", "books"],
      keywords: ["set", "kit", "wallet", "gift", "speaker", "care"],
      reason: "Selected for gifting, hosting, and festive self-upgrades.",
    },
  },
  {
    id: "winter",
    label: "Winter",
    months: [11, 0, 1],
    section: {
      id: "winter-picks",
      title: "Winter Picks",
      eyebrow: "Cold-season edit",
      description: "Comfort-led picks for cozy routines, gifting, and indoor time.",
      icon: "\u2744",
      categories: ["fashion", "footwear", "home-kitchen", "beauty", "books"],
      keywords: ["wool", "hoodie", "cream", "home", "book"],
      reason: "Picked for comfort, layering, and slower winter routines.",
    },
  },
];

const festivalSectionConfig = (festival: SeasonalFestival): SectionConfig => {
  switch (festival.id) {
    case "diwali":
      return {
        id: "diwali-deals",
        title: "Diwali Deals",
        eyebrow: "Festival spotlight",
        description: "Gift-ready and celebration-friendly picks for Diwali hosting and sharing.",
        icon: festival.icon,
        categories: ["home-kitchen", "accessories", "beauty", "fashion"],
        keywords: ["set", "kit", "wallet", "care", "home", "gift"],
        reason: "Selected for gifting, hosting, and festive Diwali moments.",
      };
    case "holi":
      return {
        id: "holi-specials",
        title: "Holi Specials",
        eyebrow: "Festival spotlight",
        description: "Fresh, casual, and vibrant picks that suit Holi season shopping.",
        icon: festival.icon,
        categories: ["fashion", "beauty", "sports-fitness", "accessories"],
        keywords: ["runner", "care", "sport", "light", "daily"],
        reason: "Selected for playful gifting and easy festive-day shopping.",
      };
    case "eid-al-fitr":
    case "eid-al-adha":
      return {
        id: "eid-specials",
        title: "Festival Specials",
        eyebrow: "Festival spotlight",
        description: "Polished gifting, self-care, and home picks for Eid celebrations.",
        icon: festival.icon,
        categories: ["fashion", "beauty", "accessories", "home-kitchen"],
        keywords: ["set", "kit", "care", "wallet", "home"],
        reason: "Chosen for gifting, gathering, and festive Eid prep.",
      };
    case "christmas":
      return {
        id: "christmas-specials",
        title: "Christmas Picks",
        eyebrow: "Festival spotlight",
        description: "Giftable and cozy picks for year-end celebrations.",
        icon: festival.icon,
        categories: ["home-kitchen", "books", "accessories", "electronics"],
        keywords: ["gift", "speaker", "home", "portable", "daily"],
        reason: "Curated for gifting, hosting, and end-of-year celebrations.",
      };
    case "new-year":
    default:
      return {
        id: "new-year-picks",
        title: "New Year Picks",
        eyebrow: "Festival spotlight",
        description: "Fresh-start picks for routines, upgrades, and new-year energy.",
        icon: festival.icon,
        categories: ["electronics", "sports-fitness", "beauty", "books"],
        keywords: ["sport", "portable", "care", "book", "recovery"],
        reason: "Chosen for fresh routines, self-improvement, and new-year momentum.",
      };
  }
};

const buildFestival = (festival: (typeof festivalCalendar)[number], today: Date): SeasonalFestival => {
  const targetDate = new Date(`${festival.date}T00:00:00`);
  const countdownDays = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    id: festival.id,
    name: festival.name,
    icon: festival.icon,
    date: festival.date,
    countdownDays,
    tagline: festival.tagline,
    saleLabel:
      countdownDays >= 0 && countdownDays <= FESTIVAL_LOOKAHEAD_DAYS
        ? `${festival.saleLabel} ends in ${countdownDays} day${countdownDays === 1 ? "" : "s"}`
        : null,
  };
};

const detectCurrentSeason = (today: Date) => {
  const month = today.getMonth();
  return (
    seasonConfigs.find((season) => season.months.includes(month)) ?? seasonConfigs[0]
  );
};

const detectUpcomingFestival = (today: Date): SeasonalFestival | null => {
  const baseFestivals = festivalCalendar.map((festival) => buildFestival(festival, today));

  if (MANUAL_FESTIVAL_OVERRIDE) {
    return (
      baseFestivals.find((festival) => festival.id === MANUAL_FESTIVAL_OVERRIDE) ?? null
    );
  }

  return (
    baseFestivals
      .filter((festival) => festival.countdownDays >= 0 && festival.countdownDays <= FESTIVAL_LOOKAHEAD_DAYS)
      .sort((a, b) => a.countdownDays - b.countdownDays)[0] ?? null
  );
};

const sectionQuery = (config: SectionConfig): Prisma.ProductWhereInput => ({
  isActive: true,
  stockQuantity: { gt: 0 },
  OR: [
    { category: { slug: { in: config.categories } } },
    ...config.keywords.map((keyword) => ({
      OR: [
        { name: { contains: keyword, mode: "insensitive" as const } },
        { description: { contains: keyword, mode: "insensitive" as const } },
      ],
    })),
  ],
});

const buildSection = async (
  config: SectionConfig,
  activeFestival: SeasonalFestival | null,
): Promise<SeasonalRecommendationSection | null> => {
  const products = await prisma.product.findMany({
    where: sectionQuery(config),
    select: productSelect,
    orderBy: [{ purchaseCount: "desc" }, { viewCount: "desc" }, { averageRating: "desc" }],
    take: 4,
  });

  if (products.length === 0) {
    return null;
  }

  const items: RecommendationItem[] = products.map((product, index) => {
    const popularity =
      clamp(product.purchaseCount / 200) * 0.5 +
      clamp(product.viewCount / 1800) * 0.3 +
      clamp(toNumber(product.averageRating) / 5) * 0.2;

    return {
      product: mapProduct(product),
      score: {
        ...emptyScore,
        popularity: Number(popularity.toFixed(4)),
        hybrid: Number((popularity + 1 / (index + 1) * 0.1).toFixed(4)),
      },
      reason:
        activeFestival && config.id.includes(activeFestival.id.split("-")[0])
          ? activeFestival.tagline
          : config.reason,
      badges: getPopularityBadges(product),
    };
  });

  return {
    id: config.id,
    title: config.title,
    eyebrow: config.eyebrow,
    description: config.description,
    icon: config.icon,
    items,
  };
};

export const getSeasonalRecommendations = async (): Promise<SeasonalRecommendationResponse> => {
  const today = new Date();
  const season = detectCurrentSeason(today);
  const activeFestival = detectUpcomingFestival(today);

  const sectionConfigs: SectionConfig[] = [season.section];

  if (activeFestival) {
    sectionConfigs.push(festivalSectionConfig(activeFestival));
  }

  const sections = (
    await Promise.all(sectionConfigs.map((config) => buildSection(config, activeFestival)))
  ).filter((section): section is SeasonalRecommendationSection => section !== null);

  return {
    currentSeason: season.label,
    activeFestival,
    sections,
  };
};
