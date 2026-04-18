import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { cartRouter } from "./cart.routes.js";
import { eventRouter } from "./event.routes.js";
import { healthRouter } from "./health.routes.js";
import { orderRouter } from "./order.routes.js";
import { productRouter } from "./product.routes.js";
import { recommendationRouter } from "./recommendation.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/recommendations", recommendationRouter);
