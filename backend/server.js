require("./lib/loadEnv")();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "E-commerce recommendation backend is running",
    port: PORT,
  });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/view", viewRoutes);
app.use("/", recommendationRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: error.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
