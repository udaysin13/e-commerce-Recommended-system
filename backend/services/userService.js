/**
 * User Service
 * Business logic for user operations
 */

const prisma = require("../lib/prisma");
const { ApiError } = require("../middleware/errorHandler");

/**
 * Create a new user
 */
async function createUser(userData) {
  const { email, password, name, phone } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user (in production, hash the password!)
  const user = await prisma.user.create({
    data: {
      email,
      password, // WARNING: Hash this in production!
      name,
      phone,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

/**
 * Update user profile
 */
async function updateUserProfile(userId, updateData) {
  const { name, phone } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
    },
  });

  return user;
}

/**
 * Delete user account
 */
async function deleteUser(userId) {
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User account deleted successfully" };
}

/**
 * Get user's order history
 */
async function getUserOrders(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user's view history
 */
async function getUserViewHistory(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const views = await prisma.viewHistory.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { viewedAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.viewHistory.count({ where: { userId } });

  return {
    views,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
  deleteUser,
  getUserOrders,
  getUserViewHistory,
};
