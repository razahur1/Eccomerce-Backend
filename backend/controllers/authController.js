import {
  hashPassword,
  comparePassword,
  generateOTP,
  generateResetToken,
} from "../helpers/authHelper.js";
import { sendMail } from "../helpers/mailHelper.js";

import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

import JWT from "jsonwebtoken";

// POST - Account Verification
export const AccountVerificationController = async (req, res) => {
  try {
    const { firstName, email, password, role } = req.body;

    // Validation
    if (!firstName) return res.status(400).send({ error: "Name is required" });
    if (!email) return res.status(400).send({ error: "Email is required" });
    if (!password)
      return res.status(400).send({ error: "Password is required" });

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (user) {
      if (user.otp && user.otpExpiration > Date.now()) {
        return res.status(400).send({
          success: false,
          message: "An OTP is already pending. Please check your email.",
        });
      }
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

    const emailBody = `
    <html>
    <body style="font-family: Arial, sans-serif; color: #ddd; background-color: #222; margin: 0; padding: 0;">
      <div style="
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #333;
        border: 1px solid #444;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
      ">
      <div style="text-align: center; padding-bottom: 10px; border-bottom: 2px solid #007bff; margin-bottom: 20px;">
        <h2 style="color: #007bff; margin: 0;">Verify Your Account</h2>
      </div>
      <div style="font-size: 16px; line-height: 1.5; color: #ccc;">
        <p style="margin: 0;">Welcome to <strong>Siyah</strong>!</p>
        <p style="margin: 10px 0;">We need to confirm your identity before you can start using your account. Your verification code is:</p>
        <div style="text-align: center;">
          <span style="font-size: 28px; font-weight: bold; color: #ff5733; display: inline-block; margin: 10px 0;">${otp}</span>
        </div>
        <p style="margin: 10px 0;">This code will expire in 2 minutes. If you didn’t request this verification, please ignore this email.</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;" />
      <div style="text-align: center; font-size: 16px;">
        <p style="margin: 0;">Best regards,<br /><strong style="color: #007bff;">Siyah Team</strong></p>
        <p style="margin: 10px 0; font-size: 14px; color: #888;">If you have any questions, feel free to contact us.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    // Send OTP via email
    await sendMail(email, "Account Verification", emailBody);

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

// POST - verify OTP and REGISTER
export const registerController = async (req, res) => {
  try {
    const { firstName, otp, email, password, role } = req.body;

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
      firstName,
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
        message: "Email is not registered. Please signup first.",
      });
    }

    // Compare the password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Construct a response object with only the desired fields
    const responseData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto,
    };

    // Add role only if the user is an admin
    if (user.role === "admin") {
      responseData.role = user.role;
    }

    // Generate JWT token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Set token in cookie
    res
      .status(200)
      .cookie("token", token, {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        domain: "localhost",
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      })
      .send({
        success: true,
        message: "Login successfully",
        user: responseData,
        token,
      });
    console.log("Cookie set:", res.getHeader("Set-Cookie"));
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

// GET - logout Controller
export const logoutController = async (req, res) => {
  try {
    // Clear the cookie by setting its expiration to a past date
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(0),
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        domain: "localhost",
      })
      .send({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in logout",
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

    // Check if the user already has a valid reset token
    if (user.resetToken && user.resetTokenExpiration > Date.now()) {
      return res.status(400).send({
        success: false,
        message:
          "A password reset request is already pending. Please wait until the current request expires.",
      });
    }

    // Generate a new reset token and expiration time
    const resetToken = generateResetToken();
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour from now

    // Update or set the reset token and expiration time
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Generate the reset link
    const resetLink = `${process.env.BASE_URL}/frontend/pages/login/reset-password.html?userId=${user._id}&token=${user.resetToken}`;

    // Send reset link via email with HTML formatting
    const emailBody = `
  <html>
  <body style="font-family: Arial, sans-serif; color: #ddd; background-color: #222; margin: 0; padding: 0;">
    <div style="
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #333;
        border: 1px solid #444;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
      ">
      <div style="text-align: center; padding-bottom: 10px; border-bottom: 2px solid #007bff; margin-bottom: 20px;">
        <h2 style="color: #007bff; margin: 0;">Password Reset Request</h2>
      </div>
      <div style="font-size: 16px; line-height: 1.5; color: #ccc;">
        <p style="margin: 0;">You have requested to reset your password. Click the link below to reset it:</p>
        <p style="margin: 10px 0;">
          <a href="${resetLink}" style="text-align: center; color: #ff5733; text-decoration: none; font-weight: bold;">Reset Password</a>
        </p>
        <p style="margin: 10px 0;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;" />
      <div style="text-align: center; font-size: 16px;">
        <p style="margin: 0;">Thank you,</p>
        <p style="margin: 0;"><strong style="color: #007bff;">Siyah</strong></p>
      </div>
    </div>
  </body>
  </html>
    `;

    await sendMail(email, "Password Reset Request", emailBody);

    res.status(200).send({
      success: true,
      message: "Password reset link sent to your email",
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

// POST - Reset Password
export const resetPasswordController = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Verify the reset token and its expiration
    if (user.resetToken !== token || user.resetTokenExpiration < Date.now()) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

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
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const user = req.user;
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
