import express from "express";
import {
  addProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  addProductImagesController,
  deleteProductImageController,
  addProductReviewController,
  getProductReviewController,
  getRelatedProductsController,
} from "../controllers/productController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";
import { multipleUpload, singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// POST || Add a new product
router.post(
  "/create",
  requireSignIn,
  IsAdmin,
  multipleUpload,
  addProductController
);

// GET || Get all products
router.get("/get-all", getProductsController);

// GET || Get a single product by ID
router.get("/:id", getProductByIdController);

// PUT || Update a product by ID
router.put(
  "/update/:id",
  requireSignIn,
  IsAdmin,
  multipleUpload,
  updateProductController
);

// DELETE || Delete a product by ID
router.delete("/delete/:id", requireSignIn, IsAdmin, deleteProductController);

// POST || add a product image
router.post(
  "/:productId/add-image/:imageId",
  requireSignIn,
  IsAdmin,
  multipleUpload,
  addProductImagesController
);

// DELETE || delete a product image
router.delete(
  "/:productId/delete-image/:imageId",
  requireSignIn,
  IsAdmin,
  deleteProductImageController
);

// GET || Get related products with category and tags
router.get("/:id/related", getRelatedProductsController);

// POST || create product review
router.post("/:id/review/create", requireSignIn, addProductReviewController);

// GET || Get product review
router.get("/:id/review", getProductReviewController);

export default router;
