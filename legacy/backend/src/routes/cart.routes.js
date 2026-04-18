import express from "express";
import { addToCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", addToCart);

export default router; // ✅ MUST BE DEFAULT EXPORT