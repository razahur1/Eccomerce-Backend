import express from "express";
import {
  getUsersController,
  getUserProfileController,
  updateProfileController,
  updateProfilePicController,
  updateProfileWithPicController
} from "../controller/userController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// GET - Get All Users
router.get("/", requireSignIn, IsAdmin, getUsersController);

// GET - Get User Profile
router.get("/profile", requireSignIn, getUserProfileController);

// PUT - Update User Profile
router.put("/profile-update", requireSignIn, updateProfileController);

// PUT - Update User Profile Pic
router.put("/update-picture", requireSignIn, singleUpload, updateProfilePicController);

// PUT - Update User Profile Pic
router.put("/update-profile", requireSignIn, singleUpload, updateProfilePicController);

export default router;
