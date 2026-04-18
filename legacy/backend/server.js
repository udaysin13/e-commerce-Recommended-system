require("./lib/loadEnv")();

const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");

// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const advancedRecommendationRoutes = require("./routes/advancedRecommendationRoutes");
const enhancedRecommendationRoutes = require("./routes/enhancedRecommendationRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============================================
// HEALTH CHECK
// ============================================

app.get("/", (_req, res) => {
  res.json({
    message: "E-commerce Recommendation Backend",
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      recommendations: "/api/recommendations",
      enhanced_recommendations: "/api/enhanced-recommendations",
      advanced_recommendations: "/api/advanced-recommendations",
      auth: "/api/auth",
    },
  });
});

// ============================================
// API ROUTES
// ============================================

const apiRouter = express.Router();

// User management
apiRouter.use("/users", userRoutes);

// Products
apiRouter.use("/products", productRoutes);

// Shopping cart
apiRouter.use("/cart", cartRoutes);

// Orders
apiRouter.use("/orders", orderRoutes);

// Authentication
apiRouter.use("/auth", authRoutes);

// Recommendations
apiRouter.use("/recommendations", recommendationRoutes);

// Enhanced Recommendations (frontend integration)
apiRouter.use("/enhanced-recommendations", enhancedRecommendationRoutes);

// Advanced Recommendations (Intermediate-level)
apiRouter.use("/advanced-recommendations", advancedRecommendationRoutes);

// View tracking
apiRouter.use("/view", viewRoutes);

// Mount all API routes under /api
app.use("/api", apiRouter);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    statusCode: 404,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log("E-Commerce Backend Server Running");
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "postgresql"}`);
});

// Handle uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
