import type { Request, RequestHandler } from "express";
import {
  createOrderFromCart,
  createBuyNowOrder,
  getOrderById,
  getOrders,
} from "../services/orderService.js";
import {
  validateCreateOrderInput,
  validateBuyNowOrderInput,
  validateOrderIdParam,
} from "../validators/order.validation.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.auth) {
    throw new HttpError(httpStatus.unauthorized, "Authentication is required.");
  }

  return req.auth.userId;
};

export const createOrderController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const input = validateCreateOrderInput(req.body);
  const order = await createOrderFromCart(userId, input);

  res.status(httpStatus.created).json({
    success: true,
    data: { order },
  });
};

export const listOrdersController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const orders = await getOrders(userId);

  res.status(httpStatus.ok).json({
    success: true,
    data: { orders },
  });
};

export const getOrderByIdController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const orderId = validateOrderIdParam(req.params.id);
  const order = await getOrderById(userId, orderId);

  res.status(httpStatus.ok).json({
    success: true,
    data: { order },
  });
};

export const buyNowController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { productId, quantity, ...address } = validateBuyNowOrderInput(req.body);
  const order = await createBuyNowOrder(userId, productId, quantity, address);

  res.status(httpStatus.created).json({
    success: true,
    data: { order },
  });
};
