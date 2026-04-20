import type { RequestHandler } from "express";
import { chatWithAssistant, searchProductsWithAI } from "../services/aiService.js";
import { validateProductListQuery } from "../validators/product.validation.js";
import { validateAIMessage } from "../validators/ai.validation.js";
import { httpStatus } from "../utils/httpStatus.js";

export const aiSearchController: RequestHandler = async (req, res) => {
  const querySource = req.method === "POST" ? { ...req.query, ...req.body, search: req.body.query ?? req.body.search ?? req.query.search } : req.query;
  const query = validateProductListQuery(querySource);
  const search = validateAIMessage(query.search, "query");
  const result = await searchProductsWithAI({
    query: search,
    page: query.page,
    limit: query.limit,
  });

  res.status(httpStatus.ok).json({
    success: true,
    data: result,
  });
};

export const aiAssistantController: RequestHandler = async (req, res) => {
  const message = validateAIMessage(req.body.message);
  const result = await chatWithAssistant({
    message,
    sessionId: typeof req.body.sessionId === "string" ? req.body.sessionId : undefined,
    userId: req.auth?.userId,
  });

  res.status(httpStatus.ok).json({
    success: true,
    data: result,
  });
};
