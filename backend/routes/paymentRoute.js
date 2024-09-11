import express from "express";
import {
  addPaymentController,
  getPaymentsController,
  getDefaultPaymentController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
} from "../controllers/paymentController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST || Add a new payment method
router.post("/add", requireSignIn, addPaymentController);

// GET || Get all payment methods for a user
router.get("/get-all", requireSignIn, getPaymentsController);

// GET || Get default Payment for user
router.get("/default", requireSignIn, getDefaultPaymentController);

// GET || Get a specific payment method by ID
router.get("/:id", requireSignIn, getPaymentByIdController);

// PUT || Update a payment method
router.put("/update/:id", requireSignIn, updatePaymentController);

// DELETE || Delete a payment method
router.delete("/delete/:id", requireSignIn, deletePaymentController);

export default router;
