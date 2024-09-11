import express from "express";
import {
  addProductController,
  getProductsController,
  getProductsByCategoryController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  addProductReviewController,
  getProductReviewController,
} from "../controllers/productController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";
import { multipleUpload, singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// POST || Add a new product
router.post("/create",requireSignIn,IsAdmin,multipleUpload,addProductController);

// GET || Get all products
router.get("/get-all", getProductsController);

// GET || Get products by category
//router.get("/:categoryid", getProductsByCategoryController);

// GET || Get a single product by ID
router.get("/:id", getProductByIdController);

// PUT || Update a product by ID
router.put("/update/:id",requireSignIn,IsAdmin,multipleUpload,updateProductController);

// DELETE || Delete a product by ID
router.delete("/delete/:id", requireSignIn, IsAdmin, deleteProductController);

// GET || create product review
router.post("/:id/review/create", requireSignIn, addProductReviewController);

// GET || Get product review
router.get("/:id/review", requireSignIn, getProductReviewController);

export default router;
