const users = [
  { id: 1, email: "alice@example.com", password: "alice123" },
  { id: 2, email: "bob@example.com", password: "bob123" },
  { id: 3, email: "cara@example.com", password: "cara123" },
];

const realProductImage = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=900`;

const products = [
  {
    id: 1,
    name: "iPhone 15",
    description: "Apple iPhone 15 with advanced camera performance and sleek design.",
    category: "Electronics",
    price: 79999,
    imageUrl:
      realProductImage("Mobile phone.jpg"),
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    description: "Samsung Galaxy S24 with stunning display and powerful processor.",
    category: "Electronics",
    price: 74999,
    imageUrl:
      realProductImage("Android smartphones.jpg"),
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    description: "Sony noise-cancelling headphones with premium audio quality.",
    category: "Electronics",
    price: 24999,
    imageUrl:
      realProductImage("Bose QuietComfort 35 II Wireless Headphones.jpg"),
  },
  {
    id: 4,
    name: "Nike Air Max SC",
    description: "Comfortable Nike Air Max sneakers for everyday style and support.",
    category: "Fashion",
    price: 6999,
    imageUrl:
      realProductImage("Sneaker.jpg"),
  },
  {
    id: 5,
    name: "Levi's Jeans",
    description: "Classic Levi's 501 denim jeans with perfect fit and durability.",
    category: "Fashion",
    price: 4999,
    imageUrl:
      realProductImage("Denimjeans.JPG"),
  },
  {
    id: 6,
    name: "Philips Air Fryer",
    description: "Philips air fryer for crispy, healthy cooking with minimal oil.",
    category: "Home",
    price: 8999,
    imageUrl:
      realProductImage("Air Fryer 5458.jpg"),
  },
  {
    id: 7,
    name: "Atomic Habits",
    description: "Practical guide to building good habits and breaking bad ones.",
    category: "Books",
    price: 699,
    imageUrl:
      realProductImage("Atomic habits.jpg"),
  },
  {
    id: 8,
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap for fitness activities.",
    category: "Sports",
    price: 1499,
    imageUrl:
      realProductImage("Yoga mat.jpg"),
  },
  {
    id: 9,
    name: "Face Moisturizer",
    description: "Hydrating face moisturizer for all skin types.",
    category: "Beauty",
    price: 1299,
    imageUrl:
      realProductImage("SansZit moisturizing anti-acne cream.jpg"),
  },
  {
    id: 10,
    name: "Mixer Grinder",
    description: "Compact mixer grinder for everyday kitchen prep and smoothies.",
    category: "Appliances",
    price: 3499,
    imageUrl: realProductImage("Mixer grinder.jpg"),
  },
];

const orders = [
  { id: 1, userId: 1, productId: 1 },
  { id: 2, userId: 1, productId: 3 },
  { id: 3, userId: 2, productId: 1 },
  { id: 4, userId: 2, productId: 2 },
  { id: 5, userId: 2, productId: 5 },
  { id: 6, userId: 3, productId: 7 },
];

const viewHistory = [
  { id: 1, userId: 1, productId: 1 },
  { id: 2, userId: 1, productId: 2 },
  { id: 3, userId: 1, productId: 3 },
  { id: 4, userId: 2, productId: 4 },
  { id: 5, userId: 2, productId: 5 },
  { id: 6, userId: 3, productId: 7 },
  { id: 7, userId: 3, productId: 8 },
];

module.exports = {
  users,
  products,
  orders,
  viewHistory,
};
