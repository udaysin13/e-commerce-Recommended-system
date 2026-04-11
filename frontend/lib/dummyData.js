/**
 * Dummy Product Data for Development
 * This data can be replaced with API calls in production
 */

const realProductImage = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=900`;

export const dummyProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 4999,
    rating: 4.5,
    reviews: 324,
    imageUrl: realProductImage("Bose QuietComfort 35 II Wireless Headphones.jpg"),
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    discount: 20,
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Ultra Fast USB-C Phone Charger",
    category: "Electronics",
    price: 1299,
    rating: 4.8,
    reviews: 1205,
    imageUrl: realProductImage("USB Type-C Cable - iPad USB-C Charger (45640822114).jpg"),
    description: "Compatible with all devices, 65W ultra-fast charging, compact design.",
    discount: 15,
    inStock: true,
    badge: "Top Rated",
  },
  {
    id: 3,
    name: "Elegant Smart Watch",
    category: "Electronics",
    price: 12999,
    rating: 4.3,
    reviews: 567,
    imageUrl: realProductImage("Smart Watch.jpg"),
    description: "AMOLED display, 7-day battery, heart rate monitor, water resistant.",
    discount: 25,
    inStock: true,
    badge: "Limited Offer",
  },
  {
    id: 4,
    name: "4K Webcam for Streaming",
    category: "Electronics",
    price: 5999,
    rating: 4.6,
    reviews: 421,
    imageUrl: realProductImage("Webcam.JPG"),
    description: "Ultra HD 4K resolution, auto-focus, built-in microphone, plug-and-play.",
    discount: 10,
    inStock: true,
    badge: "Trending",
  },
  {
    id: 5,
    name: "Premium Cotton T-Shirt Collection",
    category: "Fashion",
    price: 599,
    rating: 4.4,
    reviews: 892,
    imageUrl: realProductImage("FairtradeCertifiedCottonTShirt.jpg"),
    description: "100% organic cotton, comfortable fit, available in 10 colors.",
    discount: 30,
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: 6,
    name: "Casual Denim Jeans",
    category: "Fashion",
    price: 1399,
    rating: 4.7,
    reviews: 1450,
    imageUrl: realProductImage("Denimjeans.JPG"),
    description: "Classic fit, fade-resistant, perfect for everyday wear.",
    discount: 20,
    inStock: true,
    badge: "Popular",
  },
  {
    id: 7,
    name: "Winter Wool Jacket",
    category: "Fashion",
    price: 3999,
    rating: 4.5,
    reviews: 234,
    imageUrl: realProductImage("WinterWear2011.JPG"),
    description: "Warm wool blend, water-resistant, stylish design.",
    discount: 35,
    inStock: true,
    badge: "New Arrival",
  },
  {
    id: 8,
    name: "Stainless Steel Kitchen Knife Set",
    category: "Home",
    price: 2499,
    rating: 4.8,
    reviews: 789,
    imageUrl: realProductImage("A set of knives.jpg"),
    description: "Professional grade, 6-piece set, ergonomic handles, lifetime warranty.",
    discount: 25,
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: 9,
    name: "Modern LED Desk Lamp",
    category: "Home",
    price: 1899,
    rating: 4.4,
    reviews: 501,
    imageUrl: realProductImage("Retro desk lamp.jpg"),
    description: "Adjustable brightness, USB charging port, eye-care technology.",
    discount: 15,
    inStock: true,
    badge: "Trending",
  },
  {
    id: 10,
    name: "Luxury Bedding Set",
    category: "Home",
    price: 4499,
    rating: 4.6,
    reviews: 678,
    imageUrl: realProductImage("Hotel Pillow and Bedding (39935420303).jpg"),
    description: "Egyptian cotton, 400 thread count, queen size, includes pillows.",
    discount: 30,
    inStock: true,
    badge: "Premium",
  },
  {
    id: 11,
    name: "Natural Face Serum",
    category: "Beauty",
    price: 1299,
    rating: 4.7,
    reviews: 923,
    imageUrl: realProductImage("300ml square cosmetic plastic bottle.jpg"),
    description: "Vitamin C enriched, brightens skin, reduces fine lines, 30ml bottle.",
    discount: 20,
    inStock: true,
    badge: "Top Rated",
  },
  {
    id: 12,
    name: "Moisturizing Night Cream",
    category: "Beauty",
    price: 899,
    rating: 4.5,
    reviews: 634,
    imageUrl: realProductImage("SansZit moisturizing anti-acne cream.jpg"),
    description: "Deep hydration formula, anti-aging benefits, 50ml jar.",
    discount: 15,
    inStock: true,
    badge: "Bestseller",
  },
  {
    id: 13,
    name: "Mixer Grinder",
    category: "Appliances",
    price: 3499,
    rating: 4.4,
    reviews: 318,
    imageUrl: realProductImage("Mixer grinder.jpg"),
    description: "Compact mixer grinder for everyday kitchen prep and smoothies.",
    discount: 18,
    inStock: true,
    badge: "Popular",
  },
];

export const categoryIcons = {
  Electronics: "⚡",
  Fashion: "👗",
  Home: "🏠",
  Beauty: "💄",
  General: "🛍️",
};

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    content: "Amazing collection and super fast delivery. Highly recommended!",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Tech Reviewer",
    content: "Quality products at great prices. The recommendations are spot-on!",
    rating: 5,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Home Decorator",
    content: "Love the variety of home products. Perfect for my recent renovation.",
    rating: 4,
    avatar: "ED",
  },
];

export const features = [
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Free shipping on orders over ₹500. 2-3 days delivery.",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    description: "100% secure transactions with SSL encryption.",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "30-day return policy, no questions asked.",
  },
  {
    icon: "💬",
    title: "24/7 Support",
    description: "Dedicated customer support team ready to help.",
  },
];

export const getProductsByCategory = (category) => {
  if (!category) return dummyProducts;
  return dummyProducts.filter((p) => p.category === category);
};

export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return dummyProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
};

export const getRecommendedProducts = (limit = 4) => {
  return dummyProducts
    .filter((p) => p.rating >= 4.5)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, limit);
};

export const getTrendingProducts = (limit = 4) => {
  return dummyProducts.slice(0, limit);
};

export const getSimilarProducts = (productId, limit = 4) => {
  const product = dummyProducts.find((p) => p.id === productId);
  if (!product) return [];

  return dummyProducts
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
};
