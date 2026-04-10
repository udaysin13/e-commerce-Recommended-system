const prisma = require("./prisma");
const seedData = require("./seedData");

let hasLoggedFallback = false;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const state = {
  users: clone(seedData.users),
  products: clone(seedData.products),
  orders: clone(seedData.orders),
  viewHistory: clone(seedData.viewHistory),
};

function isDatabaseConnectivityError(error) {
  if (!error) return false;

  const message = String(error.message || "").toLowerCase();
  return (
    error.code === "P1001" ||
    message.includes("connect") ||
    message.includes("connection") ||
    message.includes("econnrefused")
  );
}

async function withFallback(primaryOperation, fallbackOperation) {
  try {
    return await primaryOperation();
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) {
      throw error;
    }

    if (!hasLoggedFallback) {
      hasLoggedFallback = true;
      console.warn("Database unavailable. Falling back to in-memory seeded data.");
    }

    return fallbackOperation();
  }
}

function findProductById(productId) {
  return state.products.find((product) => product.id === productId) || null;
}

function findUserById(userId) {
  return state.users.find((user) => user.id === userId) || null;
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    if (!product || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

async function getProducts({ page = 1, limit = 8, category = "", search = "" }) {
  return withFallback(
    async () => {
      const skip = (page - 1) * limit;
      const where = {
        AND: [
          category ? { category: { equals: category, mode: "insensitive" } } : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { category: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      };

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { id: "asc" },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    },
    () => {
      const normalizedCategory = category.trim().toLowerCase();
      const normalizedSearch = search.trim().toLowerCase();
      const filteredItems = state.products.filter((product) => {
        const matchesCategory =
          !normalizedCategory || product.category.toLowerCase() === normalizedCategory;
        const matchesSearch =
          !normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.category.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      });

      const total = filteredItems.length;
      const skip = (page - 1) * limit;

      return {
        items: filteredItems.slice(skip, skip + limit),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }
  );
}

async function getProductById(productId) {
  return withFallback(
    () => prisma.product.findUnique({ where: { id: productId } }),
    () => findProductById(productId)
  );
}

async function getUserById(userId) {
  return withFallback(
    () => prisma.user.findUnique({ where: { id: userId } }),
    () => findUserById(userId)
  );
}

async function findUserByEmail(email) {
  return withFallback(
    () => prisma.user.findUnique({ where: { email } }),
    () => state.users.find((user) => user.email === email) || null
  );
}

async function findUserByCredentials(email, password) {
  return withFallback(
    () => prisma.user.findFirst({ where: { email, password } }),
    () => state.users.find((user) => user.email === email && user.password === password) || null
  );
}

async function createUser({ email, password }) {
  return withFallback(
    () => prisma.user.create({ data: { email, password } }),
    () => {
      const user = { id: state.users.length + 1, email, password };
      state.users.push(user);
      return user;
    }
  );
}

async function createOrder({ userId, productId }) {
  return withFallback(
    () => prisma.order.create({ data: { userId, productId } }),
    () => {
      const order = { id: state.orders.length + 1, userId, productId };
      state.orders.push(order);
      return order;
    }
  );
}

async function createView({ userId, productId }) {
  return withFallback(
    () => prisma.viewHistory.create({ data: { userId, productId } }),
    () => {
      const view = { id: state.viewHistory.length + 1, userId, productId };
      state.viewHistory.push(view);
      return view;
    }
  );
}

async function getSimilarProducts(productId) {
  return withFallback(
    async () => {
      const baseProduct = await prisma.product.findUnique({ where: { id: productId } });

      if (!baseProduct) return [];

      const minPrice = Math.max(0, baseProduct.price * 0.7);
      const maxPrice = baseProduct.price * 1.3;
      const items = await prisma.product.findMany({
        where: {
          id: { not: productId },
          OR: [{ category: baseProduct.category }, { price: { gte: minPrice, lte: maxPrice } }],
        },
        take: 8,
      });

      return items.map((item) => ({
        ...item,
        reason: item.category === baseProduct.category ? "Same category" : "Similar price range",
      }));
    },
    () => {
      const baseProduct = findProductById(productId);
      if (!baseProduct) return [];

      const minPrice = Math.max(0, baseProduct.price * 0.7);
      const maxPrice = baseProduct.price * 1.3;

      return state.products
        .filter(
          (item) =>
            item.id !== productId &&
            (item.category === baseProduct.category ||
              (item.price >= minPrice && item.price <= maxPrice))
        )
        .slice(0, 8)
        .map((item) => ({
          ...item,
          reason: item.category === baseProduct.category ? "Same category" : "Similar price range",
        }));
    }
  );
}

async function getHybridRecommendations(userId) {
  return withFallback(
    async () => {
      const viewedProducts = await prisma.viewHistory.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { id: "desc" },
        take: 5,
      });

      const userOrders = await prisma.order.findMany({
        where: { userId },
        select: { productId: true },
      });

      const contentBased = [];
      if (viewedProducts.length) {
        const averagePrice =
          viewedProducts.reduce((sum, item) => sum + item.product.price, 0) / viewedProducts.length;
        const items = await prisma.product.findMany({
          where: {
            OR: [
              { category: { in: viewedProducts.map((item) => item.product.category) } },
              { price: { gte: averagePrice * 0.7, lte: averagePrice * 1.3 } },
            ],
          },
          take: 12,
        });
        contentBased.push(...items);
      }

      const collaborative = [];
      if (userOrders.length) {
        const orderedProductIds = userOrders.map((order) => order.productId);
        const similarUsersOrders = await prisma.order.findMany({
          where: {
            productId: { in: orderedProductIds },
            userId: { not: userId },
          },
          select: { userId: true },
        });
        const similarUserIds = [...new Set(similarUsersOrders.map((item) => item.userId))];

        if (similarUserIds.length) {
          const recommendedOrders = await prisma.order.findMany({
            where: {
              userId: { in: similarUserIds },
              productId: { notIn: orderedProductIds },
            },
            include: { product: true },
            take: 12,
          });
          collaborative.push(...recommendedOrders.map((item) => item.product));
        }
      }

      return dedupeProducts([...contentBased, ...collaborative]).slice(0, 8);
    },
    () => {
      const viewedProducts = state.viewHistory
        .filter((item) => item.userId === userId)
        .slice(-5)
        .map((item) => findProductById(item.productId))
        .filter(Boolean);

      const contentBased = [];
      if (viewedProducts.length) {
        const categories = viewedProducts.map((product) => product.category);
        const averagePrice =
          viewedProducts.reduce((sum, product) => sum + product.price, 0) / viewedProducts.length;

        contentBased.push(
          ...state.products.filter(
            (product) =>
              categories.includes(product.category) ||
              (product.price >= averagePrice * 0.7 && product.price <= averagePrice * 1.3)
          )
        );
      }

      const userOrders = state.orders.filter((order) => order.userId === userId);
      const collaborative = [];
      if (userOrders.length) {
        const orderedProductIds = userOrders.map((order) => order.productId);
        const similarUserIds = [
          ...new Set(
            state.orders
              .filter(
                (order) => orderedProductIds.includes(order.productId) && order.userId !== userId
              )
              .map((order) => order.userId)
          ),
        ];

        collaborative.push(
          ...state.orders
            .filter(
              (order) =>
                similarUserIds.includes(order.userId) && !orderedProductIds.includes(order.productId)
            )
            .map((order) => findProductById(order.productId))
            .filter(Boolean)
        );
      }

      return dedupeProducts([...contentBased, ...collaborative]).slice(0, 8);
    }
  );
}

module.exports = {
  createOrder,
  createUser,
  createView,
  findUserByCredentials,
  findUserByEmail,
  getHybridRecommendations,
  getProductById,
  getProducts,
  getSimilarProducts,
  getUserById,
};
