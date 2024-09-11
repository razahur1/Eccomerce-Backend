import express from "express";
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  updateCartItemController,
} from "../controllers/cartController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST || Add item to cart
router.post("/add", requireSignIn, addToCartController);

// GET || Get user's cart
router.get("/", requireSignIn, getCartController);

// DELETE || Remove item from cart
router.delete("/remove", requireSignIn, removeFromCartController);

// PUT || Update cart item quantity
router.put("/update", requireSignIn, updateCartItemController);

export default router;
