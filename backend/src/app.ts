import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { authRouter } from "./routes/auth.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { orderTrackingRouter } from "./routes/orderTracking.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { recommendationRouter } from "./routes/recommendation.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        service: "ecommerce-recommendation-backend",
        status: "running",
      },
    });
  });

  app.use("/auth", authRouter);
  app.use("/ai", aiRouter);
  app.use("/health", healthRouter);
  app.use("/products", productRouter);
  app.use("/cart", cartRouter);
  app.use("/orders", orderRouter);
  app.use("/order-tracking", orderTrackingRouter);
  app.use("/payments", paymentRouter);
  app.use("/events", eventRouter);
  app.use("/recommendations", recommendationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
