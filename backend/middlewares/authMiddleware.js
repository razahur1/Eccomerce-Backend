import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected Routes - Token based
export const requireSignIn = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      token = req.headers.authorization;
      if (!token)
        return res.status(401).send({
          success: false,
          message: "Unauthorized User",
        });
    }
    const decodeData = JWT.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decodeData._id);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized User. Invalid or expired token.",
    });
  }
};

// Admin Access Middleware
export const IsAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== "admin") {
      return res.status(401).send({
        success: false,
        error: "Unauthorized Access",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Error in Admin Middleware",
      error,
    });
  }
};
