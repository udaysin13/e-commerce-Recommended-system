const users = [
  { id: 1, email: "alice@example.com", password: "alice123" },
  { id: 2, email: "bob@example.com", password: "bob123" },
  { id: 3, email: "cara@example.com", password: "cara123" },
];

const products = [
  {
    id: 1,
    name: "iPhone 15",
    description: "Apple iPhone 15 with advanced camera performance and sleek design.",
    category: "Electronics",
    price: 79999,
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    description: "Samsung Galaxy S24 with stunning display and powerful processor.",
    category: "Electronics",
    price: 74999,
    imageUrl:
      "https://images.unsplash.com/photo-1512499617640-c2f99981b6b5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    description: "Sony noise-cancelling headphones with premium audio quality.",
    category: "Electronics",
    price: 24999,
    imageUrl:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Nike Air Max SC",
    description: "Comfortable Nike Air Max sneakers for everyday style and support.",
    category: "Fashion",
    price: 6999,
    imageUrl:
      "https://images.unsplash.com/photo-1562158070-7013134d5d41?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Levi's Jeans",
    description: "Classic Levi's 501 denim jeans with perfect fit and durability.",
    category: "Fashion",
    price: 4999,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Philips Air Fryer",
    description: "Philips air fryer for crispy, healthy cooking with minimal oil.",
    category: "Home",
    price: 8999,
    imageUrl:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    name: "Atomic Habits",
    description: "Practical guide to building good habits and breaking bad ones.",
    category: "Books",
    price: 699,
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap for fitness activities.",
    category: "Sports",
    price: 1499,
    imageUrl:
      "https://images.unsplash.com/photo-1589080876629-53c1f4de5e9f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    name: "Face Moisturizer",
    description: "Hydrating face moisturizer for all skin types.",
    category: "Beauty",
    price: 1299,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
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
