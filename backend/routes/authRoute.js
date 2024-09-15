import express from "express";
import {
  registerController,
  loginController,
  logoutController,
  AccountVerificationController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  testController,
} from "../controllers/authController.js";
import { requireSignIn, IsAdmin } from "../middlewares/authMiddleware.js";

//route object
const router = express.Router();

//routing

// Account Verification || POST
router.post("/verify-account", AccountVerificationController); //5 min

// Register || POST
router.post("/register", registerController);

// Login || POST
router.post("/login", loginController);

// Logout || GET
router.get("/logout", requireSignIn, logoutController);

//forget-password || POST
router.post("/forgot-password", forgotPasswordController);

//reset-password || POST
router.post("/reset-password", resetPasswordController);

//Change Password || POST
router.put("/change-password", requireSignIn, changePasswordController);

//test routes
router.get("/test", requireSignIn, IsAdmin, testController);

export default router;
