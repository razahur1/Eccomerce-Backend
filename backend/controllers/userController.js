import userModel from "../models/userModel.js";
import { getDataUri } from "../helpers/dataUriHelper.js";
import cloudinary from "../config/cloudinary.js";

// GET - Get All Users
export const getUsersController = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching users",
      error,
    });
  }
};

// GET - Get User Profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    // user.password = undefined;
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).send({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching user details",
      error,
    });
  }
};

//GET - Get user by ID
export const getUserByIDController = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    // user.password = undefined;
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).send({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error fetching user details",
      error,
    });
  }
};

// PUT - Update User Profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, mobileNumber } = req.body;

    // Find the user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobileNumber = mobileNumber || user.mobileNumber;

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating user",
      error,
    });
  }
};

/// PUT - Update user profile photo
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please Upload Profile Picture",
      });
    }
    // file get from client photo
    const file = getDataUri(req.file);
    //   // delete prev image
    //   await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePhoto = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save func
    await user.save();

    res.status(200).send({
      success: true,
      message: "profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update profile pic API",
      error,
    });
  }
};

// PUT - Update user profile with photo
export const updateProfileWithPicController = async (req, res) => {
  try {
    const { name, email, mobileNumber, role } = req.body;

    // Find the user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Update user details (keep existing values if not provided)
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.mobileNumber = mobileNumber || user.mobileNumber;

    // Check if a file exists, then upload the new profile picture
    if (req.file) {
      const file = getDataUri(req.file);

      // Optional: If you want to delete the old picture from Cloudinary
      if (user.profilePhoto && user.profilePhoto.public_id) {
        await cloudinary.v2.uploader.destroy(user.profilePhoto.public_id);
      }
      
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      user.profilePhoto = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating user profile",
      error,
    });
  }
};

