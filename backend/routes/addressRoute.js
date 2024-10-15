import express from "express";
import {
  createAddressController,
  getAddressesController,
  getDefaultAddressController,
  getAddressByIdController,
  updateAddressController,
  deleteAddressController,
} from "../controllers/addressController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST || Create a new address
router.post("/create", requireSignIn, createAddressController);

// GET || Get all addresses for the logged-in user
router.get("/get-all", requireSignIn, getAddressesController);

// GET || Get a default address by ID
router.get("/default", requireSignIn, getDefaultAddressController);

// GET || Get a single address by ID
router.get("/:id", requireSignIn, getAddressByIdController);

// PUT || Update an existing address
router.put("/update/:id", requireSignIn, updateAddressController);

// DELETE || Delete an address
router.delete("/delete/:id", requireSignIn, deleteAddressController);

export default router;
