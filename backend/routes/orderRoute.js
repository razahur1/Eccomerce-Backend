import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  getUserOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  deleteOrderController,
  getPendingOrdersController
} from "../controllers/orderController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new order (User)
router.post("/create", requireSignIn, createOrderController);

// Get all orders (Admin)
router.get("/get-all", requireSignIn, IsAdmin, getAllOrdersController);

// Get all pending orders (Admin)
router.get("/get-pending", requireSignIn, IsAdmin, getPendingOrdersController);

// Get all orders for the logged-in user
router.get("/my-orders", requireSignIn, getUserOrdersController);

// Get single order by ID (User)
router.get("/:id", requireSignIn, getOrderByIdController);

// Update order status (Admin)
router.put("/update/:id", requireSignIn, IsAdmin, updateOrderStatusController);

// Delete order (Admin)
router.delete("/delete/:id", requireSignIn, IsAdmin, deleteOrderController);

export default router;
