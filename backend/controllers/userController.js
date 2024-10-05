import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import addressModel from "../models/addressModel.js";
import { getDataUri } from "../helpers/dataUriHelper.js";
import cloudinary from "../config/cloudinary.js";

// GET - Get All Users (excluding admins) with Pagination, Search, and Total Orders
export const getUsersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const startIndex = (page - 1) * limit;

    // Search query for name or email and filter out admins
    const searchQuery = {
      role: "user", // Only include users (exclude admins)
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Fetch users with pagination and selected fields
    const users = await userModel
      .find(searchQuery)
      .select(
        "firstName lastName email mobileNumber profilePhoto createdAt updatedAt"
      ) // Specify the fields to include
      .skip(startIndex)
      .limit(limit)
      .lean();

    // Get total orders for each user
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const totalOrders = await orderModel.countDocuments({
          user: user._id,
        });
        const defaultAddress = await addressModel.findOne({
          user: user._id,
          isDefault: true,
        });
        return {
          ...user,
          totalOrders,
          defaultAddress: defaultAddress || null,
        };
      })
    );

    const totalUsers = await userModel.countDocuments(searchQuery); // Total count of users matching search criteria

    res.status(200).send({
      success: true,
      users: usersWithOrderCount,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      usersPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
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
    const user = await userModel
      .findById(req.user._id)
      .select("firstName lastName email mobileNumber profilePhoto");

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
    user.password = undefined;
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

// PUT - Update user profile with photo
export const updateProfileWithPicController = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, role } = req.body;

    // Find the user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Update user details (keep existing values if not provided)
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
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
