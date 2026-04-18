import type { RequestHandler } from "express";
import {
  getProductById,
  getProducts,
  searchProducts,
} from "../services/productService.js";
import {
  validateProductIdParam,
  validateProductListQuery,
  validateProductSearchQuery,
} from "../validators/product.validation.js";
import { httpStatus } from "../utils/httpStatus.js";

export const listProductsController: RequestHandler = async (req, res) => {
  const query = validateProductListQuery(req.query);
  const products = await getProducts(query);

  res.status(httpStatus.ok).json({
    success: true,
    data: products,
  });
};

export const searchProductsController: RequestHandler = async (req, res) => {
  const query = validateProductSearchQuery(req.query);
  const products = await searchProducts(query);

  res.status(httpStatus.ok).json({
    success: true,
    data: products,
  });
};

export const getProductByIdController: RequestHandler = async (req, res) => {
  const id = validateProductIdParam(req.params.id);
  const product = await getProductById(id);

  res.status(httpStatus.ok).json({
    success: true,
    data: {
      product,
    },
  });
};
