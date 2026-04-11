const { AuthenticationError, AuthorizationError, NotFoundError, ApiError, ValidationError } = require("./errorHandler");
const { verifyJwt } = require("../lib/auth");
const logger = require("../utils/logger");
const prisma = require("../lib/prisma");

/**
 * Require authentication middleware
 * Validates JWT token from Authorization header
 */
function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    logger.warn("Missing authentication token", { path: req.path, method: req.method });
    throw new AuthenticationError("Authorization token is required");
  }

  try {
    req.user = verifyJwt(token);
    logger.debug("User authenticated", { userId: req.user.id, path: req.path });
    next();
  } catch (error) {
    logger.warn("Invalid authentication token", error);
    throw new AuthenticationError("Invalid or expired token");
  }
}

/**
 * Require user to access their own data via URL parameter
 */
function requireSelfFromParam(paramName = "userId") {
  return (req, _res, next) => {
    const requestedUserId = Number(req.params[paramName]);

    if (isNaN(requestedUserId) || requestedUserId <= 0) {
      throw new ValidationError("Valid user ID is required");
    }

    if (!req.user || req.user.id !== requestedUserId) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user?.id,
        requestedUserId,
        path: req.path,
      });
      throw new AuthorizationError("You can only access your own account data");
    }

    next();
  };
}

/**
 * Require user to access their own data via request body
 */
function requireSelfFromBody(fieldName = "userId") {
  return (req, _res, next) => {
    const requestedUserId = Number(req.body[fieldName]);

    if (isNaN(requestedUserId) || requestedUserId <= 0) {
      throw new ValidationError("Valid user ID is required in request body");
    }

    if (!req.user || req.user.id !== requestedUserId) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user?.id,
        requestedUserId,
        path: req.path,
      });
      throw new AuthorizationError("You can only access your own account data");
    }

    next();
  };
}

/**
 * Require cart item ownership
 * Verify user owns the cart item they're trying to modify
 */
async function requireCartItemOwner(req, _res, next) {
  const itemId = Number(req.params.itemId);

  if (!itemId || itemId <= 0) {
    throw new ValidationError("Valid cart item ID is required");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: {
        select: { userId: true },
      },
    },
  });

  if (!cartItem) {
    throw new NotFoundError("Cart item");
  }

  if (!req.user || cartItem.cart.userId !== req.user.id) {
    logger.warn("Unauthorized cart access", {
      userId: req.user?.id,
      cartOwnerId: cartItem.cart.userId,
      itemId,
    });
    throw new AuthorizationError("You can only modify your own cart");
  }

  req.cartItem = cartItem;
  next();
}

/**
 * Require order ownership
 * Verify user owns the order they're trying to access
 */
async function requireOrderOwner(req, _res, next) {
  const orderId = Number(req.params.orderId);

  if (!orderId || orderId <= 0) {
    throw new ValidationError("Valid order ID is required");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (!req.user || order.userId !== req.user.id) {
    logger.warn("Unauthorized order access", {
      userId: req.user?.id,
      orderOwnerId: order.userId,
      orderId,
    });
    throw new AuthorizationError("You can only access your own orders");
  }

  next();
}

/**
 * Optional authentication
 * Tries to authenticate, but doesn't fail if token is missing
 */
function optionalAuth(req, _res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      req.user = verifyJwt(token);
    } catch (error) {
      logger.debug("Failed to verify optional token", error);
      // Continue without auth
    }
  }

  next();
}

module.exports = {
  requireAuth,
  requireSelfFromParam,
  requireSelfFromBody,
  requireCartItemOwner,
  requireOrderOwner,
  optionalAuth,
};
