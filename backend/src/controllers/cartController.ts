import type { Request, RequestHandler } from "express";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService.js";
import {
  validateAddCartItemInput,
  validateCartItemIdParam,
  validateUpdateCartItemInput,
} from "../validators/cart.validation.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.auth) {
    throw new HttpError(httpStatus.unauthorized, "Authentication is required.");
  }

  return req.auth.userId;
};

export const addCartItemController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const input = validateAddCartItemInput(req.body);
  const cart = await addCartItem(userId, input);

  res.status(httpStatus.created).json({
    success: true,
    data: { cart },
  });
};

export const getCartController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const cart = await getCart(userId);

  res.status(httpStatus.ok).json({
    success: true,
    data: { cart },
  });
};

export const updateCartItemController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const cartItemId = validateCartItemIdParam(req.params.id);
  const input = validateUpdateCartItemInput(req.body);
  const cart = await updateCartItem(userId, cartItemId, input);

  res.status(httpStatus.ok).json({
    success: true,
    data: { cart },
  });
};

export const removeCartItemController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const cartItemId = validateCartItemIdParam(req.params.id);
  const cart = await removeCartItem(userId, cartItemId);

  res.status(httpStatus.ok).json({
    success: true,
    data: { cart },
  });
};
