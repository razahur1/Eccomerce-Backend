import express from "express";
import {
  getUsersController,
  getUserProfileController,
  getUserByIDController,
  updateProfileController,
  updateProfilePicController,
  updateProfileWithPicController,
} from "../controllers/userController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// GET || Get All Users
router.get("/get-all", requireSignIn, IsAdmin, getUsersController);

// GET || Get User Profile
router.get("/profile", requireSignIn, getUserProfileController);

// GET || Get User by ID
router.get("/:id", requireSignIn, IsAdmin, getUserByIDController);

// PUT || Update User Profile
//router.put("/profile-update", requireSignIn, updateProfileController);

// PUT || Update User Profile Pic
//router.put("/update-picture", requireSignIn, singleUpload, updateProfilePicController);

// PUT || Update User Profile and Pic
router.put("/update-profile",requireSignIn,singleUpload,updateProfileWithPicController);

export default router;
