import {
  hashPassword,
  comparePassword,
  generateOTP,
} from "../helpers/authHelper.js";
import { sendMail } from "../helpers/mailHelper.js";

import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";

import JWT from "jsonwebtoken";

// POST - Account Verification
export const AccountVerificationController = async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    // Validation
    if (!name) return res.status(400).send({ error: "Name is required" });
    if (!email) return res.status(400).send({ error: "Email is required" });
    if (!password)
      return res.status(400).send({ error: "Password is required" });

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(404).send({
        success: false,
        message: "Already registered. Please login.",
      });
    }
    // Validate role if provided
    const validRoles = ["admin", "user"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).send({ error: "Invalid role provided" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB
    await new otpModel({ email, otp }).save();

    // Send OTP via email
    await sendMail(
      email,
      "Account Verification",
      `Your OTP for account verification is ${otp}. This OTP is valid for 5 minutes.`
    );

    res.status(200).send({
      success: true,
      message: "OTP sent to your email. Please verify your account.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account",
      error,
    });
  }
};

// POST - REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, otp, email, password, role } = req.body;

    // Validate OTP
    const otpRecord = await otpModel.findOne({ email, otp });
    
    if (!otpRecord) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Save the new user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      role,
    }).save();

    // Delete OTP record after successful verification
    await otpModel.deleteOne({ email, otp });

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

// POST - LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.send({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Compare the password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

// POST - Forgot Password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not registered",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB
    await new otpModel({ email, otp }).save();

    // Send OTP via email
    await sendMail(
      email,
      "Your OTP for Password Reset",
      `Your OTP for password reset is ${otp}. This OTP is valid for 5 minutes.`
    );

    res.status(200).send({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in forgot password",
      error,
    });
  }
};

// POST - Verify OTP and Reset Password
export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if the OTP is correct
    const validOtp = await otpModel.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP or OTP expired",
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    await userModel.updateOne({ email }, { password: hashedPassword });

    // Delete the OTP after use (Optional)
    await otpModel.deleteOne({ email, otp });

    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in resetting password",
      error,
    });
  }
};

// POST - Change Password
export const changePasswordController = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Find the user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Verify the current password
    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in changing password",
      error,
    });
  }
};

// Test controller for protected routes
export const testController = (req, res) => {
  res.send("Protected Route");
  console.log("Protected Route");
};
