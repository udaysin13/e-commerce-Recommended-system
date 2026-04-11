const { ApiError } = require("./errorHandler");
const { verifyJwt } = require("../lib/auth");
const prisma = require("../lib/prisma");

function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is required");
  }

  try {
    req.user = verifyJwt(token);
    next();
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired token");
  }
}

function requireSelfFromParam(paramName = "userId") {
  return (req, _res, next) => {
    const requestedUserId = Number(req.params[paramName]);

    if (!req.user || req.user.id !== requestedUserId) {
      throw new ApiError(403, "You can only access your own account data");
    }

    next();
  };
}

function requireSelfFromBody(fieldName = "userId") {
  return (req, _res, next) => {
    const requestedUserId = Number(req.body[fieldName]);

    if (!req.user || req.user.id !== requestedUserId) {
      throw new ApiError(403, "You can only access your own account data");
    }

    next();
  };
}

async function requireCartItemOwner(req, _res, next) {
  const itemId = Number(req.params.itemId);

  if (!itemId || itemId <= 0) {
    throw new ApiError(400, "Valid cart item ID is required");
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
    throw new ApiError(404, "Cart item not found");
  }

  if (!req.user || cartItem.cart.userId !== req.user.id) {
    throw new ApiError(403, "You can only modify your own cart");
  }

  next();
}

module.exports = {
  requireCartItemOwner,
  requireAuth,
  requireSelfFromBody,
  requireSelfFromParam,
};
