import express from "express";
import {
  addCategoryController,
  getCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST || Add a new category
router.post("/create", requireSignIn, IsAdmin, addCategoryController);

// GET || Get all categories
router.get("/get-all", getCategoriesController);

// PUT || Update a category by ID
router.put("/update/:id", requireSignIn, IsAdmin, updateCategoryController);

// DELETE || Delete a category by ID
router.delete("/delete/:id", requireSignIn, IsAdmin, deleteCategoryController);

export default router;
