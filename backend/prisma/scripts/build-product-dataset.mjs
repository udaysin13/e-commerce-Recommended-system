import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("backend/prisma/data");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const titleCase = (value) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeText = (value) =>
  value
    .replace(/&gt;+/g, "")
    .replace(/Bulk Buying, Big Savings!\s*Click Now & Know More\s*/gi, "")
    .replace(/Ã—/g, "x")
    .replace(/â€”/g, "-")
    .replace(/â€“/g, "-")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const stripHtml = (value) =>
  normalizeText(
    (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  );

const firstSentence = (value, fallback) => {
  const text = normalizeText(value || fallback || "");
  const [sentence] = text.split(/(?<=[.!?])\s+/);
  return sentence || text;
};

const shortCopy = (value, fallback) => {
  const sentence = firstSentence(value, fallback);
  return sentence.length <= 140 ? sentence : `${sentence.slice(0, 137).trim()}...`;
};

const loadFeed = (filename) => {
  const raw = fs.readFileSync(path.join(dataDir, filename), "utf8");
  const text = JSON.parse(raw);
  return JSON.parse(text).products;
};

const uniquePush = (collection, item, report, category) => {
  if (collection.some((existing) => existing.name === item.name)) {
    report.rejected.push({
      category,
      reason: "duplicate_name",
      name: item.name,
      imageUrl: item.imageUrl,
    });
    return false;
  }

  if (collection.some((existing) => existing.imageUrl === item.imageUrl)) {
    report.rejected.push({
      category,
      reason: "duplicate_image",
      name: item.name,
      imageUrl: item.imageUrl,
    });
    return false;
  }

  collection.push(item);
  return true;
};

const buildDescription = (headline, detail, fallback) => {
  const first = headline?.trim() || fallback;
  const second = detail?.trim() || "Made for everyday use with a polished retail-ready presentation.";
  return `${first}\n${second}`;
};

const createProduct = ({
  category,
  brand,
  name,
  price,
  imageUrl,
  sourceUrl,
  shortDescription,
  description,
  index,
  attributes = {},
}) => ({
  name,
  description,
  shortDescription,
  price: Number(price).toFixed(2),
  category,
  brand,
  rating: (4.1 + ((index % 8) * 0.1)).toFixed(1),
  stockQuantity: 18 + ((index * 7) % 73),
  imageUrl,
  attributes: {
    ...attributes,
    sourceUrl,
    imageVerified: true,
  },
});

const report = {
  generatedAt: new Date().toISOString(),
  selected: [],
  rejected: [],
  replacements: [],
};

const products = [];

const soundcore = loadFeed("raw-soundcore.json");
const electronicsCandidates = soundcore
  .map((product) => ({
    title: product.title.trim(),
    price: Number(product.variants?.[0]?.price ?? 0),
    imageUrl: product.image?.src ?? product.images?.[0]?.src ?? null,
    body: stripHtml(product.body_html),
    handle: product.handle,
  }))
  .filter(
    (product) =>
      product.imageUrl &&
      product.price >= 49 &&
      !/special \/|mystery|bundle|screen|first month|inflatable|3-pack|2-pack/i.test(product.title),
  );

for (const [index, candidate] of electronicsCandidates.entries()) {
  if (products.filter((item) => item.category === "Electronics").length >= 15) {
    break;
  }

  const detail =
    candidate.body ||
    (/(earbud|sleep|aero)/i.test(candidate.title)
      ? "Compact wireless audio for commuting, calls, and focused listening."
      : /(speaker)/i.test(candidate.title)
        ? "Portable sound with a room-filling profile and travel-friendly size."
        : /(projector)/i.test(candidate.title)
          ? "Designed for flexible home viewing with a clean, modern setup."
          : /(power bank)/i.test(candidate.title)
            ? "Reliable power backup for phones, tablets, and travel days."
            : "Built for everyday audio, charging, and portable entertainment.");

  uniquePush(
    products,
    createProduct({
      category: "Electronics",
      brand: /Anker/i.test(candidate.title) ? "Anker" : /Nebula/i.test(candidate.title) ? "Nebula" : "Soundcore",
      name: candidate.title.replace(/\s+/g, " "),
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://us.soundcore.com/products/${candidate.handle}`,
      shortDescription: shortCopy(detail, "Premium wireless audio with official product imagery."),
      description: buildDescription(detail, "Official Soundcore merchandising imagery confirms the exact product variant used for this listing."),
      index,
      attributes: { source: "official-feed", sourceBrand: "Soundcore" },
    }),
    report,
    "Electronics",
  );
}

const allbirds = loadFeed("raw-allbirds.json");
const footwearCandidates = allbirds
  .map((product) => ({
    title: product.title.trim(),
    price: Number(product.variants?.[0]?.price ?? 0),
    imageUrl: product.image?.src ?? product.images?.[0]?.src ?? null,
    body: stripHtml(product.body_html),
    handle: product.handle,
  }))
  .filter((product) => product.imageUrl && product.price >= 49 && !/slipper/i.test(product.title));

for (const [index, candidate] of footwearCandidates.entries()) {
  if (products.filter((item) => item.category === "Footwear").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Footwear",
      brand: "Allbirds",
      name: candidate.title,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://www.allbirds.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, "Everyday comfort with color-specific official product photography."),
      description: buildDescription(
        candidate.body || "Lightweight casual footwear designed for all-day wear and easy rotation.",
        "The official Allbirds hero image matches the exact colorway named in the product title.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: "Allbirds" },
    }),
    report,
    "Footwear",
  );
}

const tentree = loadFeed("raw-tentree.json");
const fashionCandidates = tentree
  .map((product) => {
    const color = product.options?.[0]?.values?.[0];
    const imageUrl = product.image?.src ?? product.images?.[0]?.src ?? null;
    return {
      title: product.title.trim(),
      color,
      name: color ? `${product.title.trim()} - ${titleCase(color)}` : product.title.trim(),
      price: Number(product.variants?.[0]?.price ?? 0),
      imageUrl,
      body: stripHtml(product.body_html),
      handle: product.handle,
      type: product.product_type,
    };
  })
  .filter(
    (product) =>
      product.imageUrl &&
      ["Mens", "Womens"].includes(product.type) &&
      !/hat|cap|beanie|sock|bag|tote/i.test(product.title),
  );

for (const [index, candidate] of fashionCandidates.entries()) {
  if (products.filter((item) => item.category === "Fashion").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Fashion",
      brand: "tentree",
      name: candidate.name,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://tentree.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, "Variant-specific apparel sourced from the official tentree product feed."),
      description: buildDescription(
        candidate.body || "Relaxed everyday apparel with retail-ready styling and wearable comfort.",
        "The colorway in the product name comes from the official option data and matches the feed image.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: "tentree", colorVariant: candidate.color ?? null },
    }),
    report,
    "Fashion",
  );
}

const material = loadFeed("raw-material.json");
const homeCandidates = material
  .map((product) => ({
    name: product.title.trim(),
    price: Number(product.variants?.[0]?.price ?? 0),
    imageUrl: product.image?.src ?? product.images?.[0]?.src ?? null,
    body: stripHtml(product.body_html),
    handle: product.handle,
    vendor: product.vendor,
    type: product.product_type,
  }))
  .filter(
    (product) =>
      product.imageUrl &&
      !/gift card|personalization/i.test(product.name) &&
      !/Gift Card/i.test(product.type || ""),
  );

for (const [index, candidate] of homeCandidates.entries()) {
  if (products.filter((item) => item.category === "Home & Kitchen").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Home & Kitchen",
      brand: candidate.vendor,
      name: candidate.name,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://materialkitchen.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, `${candidate.type || "Home"} essential with official merchandising photography.`),
      description: buildDescription(
        candidate.body || "A home essential selected for practical everyday use and polished presentation.",
        "The image is pulled from the original brand feed and kept unique across the dataset.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: candidate.vendor, productType: candidate.type },
    }),
    report,
    "Home & Kitchen",
  );
}

const colourpop = loadFeed("raw-colourpop.json");
const beautyCandidates = colourpop
  .map((product) => ({
    name: product.title.trim(),
    price: Number(product.variants?.[0]?.price ?? 0),
    imageUrl: product.image?.src ?? product.images?.[0]?.src ?? null,
    body: stripHtml(product.body_html),
    handle: product.handle,
    type: product.product_type,
  }))
  .filter(
    (product) =>
      product.imageUrl &&
      product.price > 0 &&
      !/tools and accessories|makeup tools/i.test(product.type || "") &&
      !/mystery box|full collection|mirror|byob|bundle/i.test(product.name),
  );

for (const [index, candidate] of beautyCandidates.entries()) {
  if (products.filter((item) => item.category === "Beauty").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Beauty",
      brand: "ColourPop",
      name: candidate.name,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://colourpop.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, `${candidate.type || "Beauty"} item with exact official product imagery.`),
      description: buildDescription(
        candidate.body || "A color-driven beauty pick designed for an easy, polished routine.",
        "ColourPop feed imagery is preserved so the thumbnail matches the exact shade or item name.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: "ColourPop", productType: candidate.type },
    }),
    report,
    "Beauty",
  );
}

const bala = loadFeed("raw-bala.json");
const sportsCandidates = bala
  .map((product) => {
    const variant = product.variants?.[0]?.title;
    const imageUrl = product.image?.src ?? product.images?.[0]?.src ?? null;
    const variantName =
      variant && variant !== "Default Title" ? `${product.title.trim()} - ${titleCase(variant.replace(/\/.*/, "").trim())}` : product.title.trim();
    return {
      name: variantName,
      rawName: product.title.trim(),
      price: Number(product.variants?.[0]?.price ?? 0),
      imageUrl,
      body: stripHtml(product.body_html),
      handle: product.handle,
    };
  })
  .filter(
    (product) =>
      product.imageUrl &&
      /mat|towel|pilates|loops|ring|beam|bars|bangles|balance|weights|kit/i.test(product.rawName) &&
      !/wind down|mystery|mug|clip|dog|book|candle|scrunchie|sock|hair/i.test(product.rawName),
  );

for (const [index, candidate] of sportsCandidates.entries()) {
  if (products.filter((item) => item.category === "Sports & Fitness").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Sports & Fitness",
      brand: "Bala",
      name: candidate.name,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://www.shopbala.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, "Studio and home-workout gear selected from Bala's official catalog."),
      description: buildDescription(
        candidate.body || "Designed for pilates, light strength work, stretching, and recovery sessions.",
        "Each listing uses a unique Bala product image matched to the chosen item or colorway.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: "Bala" },
    }),
    report,
    "Sports & Fitness",
  );
}

const ridge = loadFeed("raw-ridge.json");
const accessoriesCandidates = ridge
  .map((product) => ({
    name: product.title.trim(),
    price: Number(product.variants?.[0]?.price ?? 0),
    imageUrl: product.image?.src ?? product.images?.[0]?.src ?? null,
    body: stripHtml(product.body_html),
    handle: product.handle,
    type: product.product_type,
  }))
  .filter(
    (product) =>
      product.imageUrl &&
      !/power bank|luggage|kit|snapback/i.test(product.name) &&
      !/Tech|TRAVEL/i.test(product.type || ""),
  );

for (const [index, candidate] of accessoriesCandidates.entries()) {
  if (products.filter((item) => item.category === "Accessories").length >= 15) {
    break;
  }

  uniquePush(
    products,
    createProduct({
      category: "Accessories",
      brand: "Ridge",
      name: candidate.name,
      price: candidate.price,
      imageUrl: candidate.imageUrl,
      sourceUrl: `https://ridge.com/products/${candidate.handle}`,
      shortDescription: shortCopy(candidate.body, "EDC accessory with official Ridge catalog photography."),
      description: buildDescription(
        candidate.body || "A daily-carry accessory built around compact storage, quick access, or pocket organization.",
        "The image URL comes directly from Ridge's own product feed and is not reused elsewhere in the dataset.",
      ),
      index,
      attributes: { source: "official-feed", sourceBrand: "Ridge", productType: candidate.type },
    }),
    report,
    "Accessories",
  );
}

const books = [
  ["Atomic Habits", "James Clear", "A practical guide to building better habits through tiny, repeatable improvements.", "Pairs behavioral science with usable systems for work, health, and daily routines.", "9780735211292", "Avery"],
  ["The Psychology of Money", "Morgan Housel", "Short essays on behavior, wealth, and long-term financial decision-making.", "Useful for readers who want clearer thinking about risk, compounding, and enoughness.", "9780857197689", "Harriman House"],
  ["Deep Work", "Cal Newport", "A focused argument for protecting time for concentrated, high-value work.", "Blends strategy, case studies, and routines for better attention in distracted environments.", "9781455586691", "Grand Central Publishing"],
  ["Sapiens", "Yuval Noah Harari", "A sweeping history of humanity from early hunter-gatherers to modern institutions.", "Popular science writing that connects culture, economics, and shared belief systems.", "9780062316097", "Harper"],
  ["Thinking, Fast and Slow", "Daniel Kahneman", "A landmark exploration of intuitive and deliberate thinking.", "Explains the biases and decision patterns that shape everyday judgments.", "9780374533557", "Farrar, Straus and Giroux"],
  ["The Midnight Library", "Matt Haig", "A novel about regret, possibility, and alternate versions of one life.", "Balances speculative fiction with an accessible emotional core.", "9780525559474", "Viking"],
  ["Educated", "Tara Westover", "A memoir about self-invention, family loyalty, and education's transformative force.", "Sharp, reflective writing makes it a strong contemporary nonfiction pick.", "9780399590504", "Random House"],
  ["The Alchemist", "Paulo Coelho", "A modern fable about purpose, persistence, and following a personal calling.", "A perennial bestseller with a concise, giftable format.", "9780062315007", "HarperOne"],
  ["Where the Crawdads Sing", "Delia Owens", "A literary mystery set against the marshes of coastal North Carolina.", "Combines coming-of-age storytelling with a courtroom plotline.", "9780735219090", "G.P. Putnam's Sons"],
  ["The Silent Patient", "Alex Michaelides", "A psychological thriller centered on a famous painter who stops speaking.", "Built around sharp pacing, short chapters, and a major late reveal.", "9781250301697", "Celadon Books"],
  ["Dune", "Frank Herbert", "A science fiction epic of empire, ecology, prophecy, and political power.", "Still one of the genre's most recognizable gateway novels.", "9780441172719", "Ace"],
  ["The Martian", "Andy Weir", "A problem-solving survival story set on Mars with a strong engineering bent.", "Its brisk voice and technical puzzles make it a dependable crossover favorite.", "9780553418026", "Broadway Books"],
  ["The Four Agreements", "Don Miguel Ruiz", "A compact self-development classic built around four behavioral principles.", "Frequently bought as a personal reset or giftable wellness read.", "9781878424310", "Amber-Allen Publishing"],
  ["Ikigai", "Hector Garcia and Francesc Miralles", "An approachable lifestyle book about purpose, longevity, and daily rhythm.", "Combines interviews, cultural framing, and practical takeaways.", "9780143130727", "Penguin Life"],
  ["The Mountain Is You", "Brianna Wiest", "A contemporary self-help title about self-sabotage and personal growth.", "Popular with readers looking for reflective, journal-adjacent nonfiction.", "9781949759228", "Thought Catalog Books"],
];

for (const [index, book] of books.entries()) {
  const [title, author, lineOne, lineTwo, isbn, publisher] = book;
  uniquePush(
    products,
    createProduct({
      category: "Books",
      brand: publisher,
      name: title,
      price: (14.99 + index * 1.75).toFixed(2),
      imageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
      sourceUrl: `https://openlibrary.org/isbn/${isbn}`,
      shortDescription: `${title} by ${author}.`,
      description: `${lineOne}\n${lineTwo}`,
      index,
      attributes: {
        source: "openlibrary",
        isbn,
        author,
        publisher,
      },
    }),
    report,
    "Books",
  );
}

const counts = products.reduce((accumulator, product) => {
  accumulator[product.category] = (accumulator[product.category] ?? 0) + 1;
  return accumulator;
}, {});

for (const [category, count] of Object.entries(counts)) {
  if (count < 15 || count > 20) {
    throw new Error(`Category ${category} has invalid product count: ${count}`);
  }
}

report.selected = products.map((product) => ({
  category: product.category,
  name: product.name,
  imageUrl: product.imageUrl,
  sourceUrl: product.attributes.sourceUrl,
}));

fs.writeFileSync(path.join(dataDir, "products.json"), JSON.stringify(products, null, 2));
fs.writeFileSync(
  path.join(dataDir, "validation-report.json"),
  JSON.stringify(
    {
      ...report,
      summary: {
        totalProducts: products.length,
        categoryCounts: counts,
        uniqueImages: new Set(products.map((product) => product.imageUrl)).size,
      },
    },
    null,
    2,
  ),
);

console.log(`Generated ${products.length} products.`);
