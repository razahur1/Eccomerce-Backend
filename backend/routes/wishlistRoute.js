import express from "express";
import {
  addToWishlistController,
  getWishlistController,
  removeFromWishlistController,
} from "../controllers/wishlistController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST || Add product to wishlist
router.post("/add", requireSignIn, addToWishlistController);

// GET || Get user's wishlist
router.get("/get-all", requireSignIn, getWishlistController);

// DELETE - Remove product from wishlist
router.delete("/remove/:id", requireSignIn, removeFromWishlistController);

export default router;
