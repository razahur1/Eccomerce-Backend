import categoryModel from "../models/categoryModel.js";
import { getDataUri } from "../helpers/dataUriHelper.js";
import cloudinary from "../config/cloudinary.js";

// POST - Add a new category
export const addCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;

    if (!name) {
      return res.status(400).send({ error: "Category name is required" });
    }

    // Upload image to Cloudinary if provided
    let imageDetails = {};
    if (image) {
      const file = getDataUri(image);

      const cdb = await cloudinary.v2.uploader.upload(file.content);
      imageDetails = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
    }

    const category = await new categoryModel({
      name,
      image: imageDetails,
    }).save();

    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in creating category",
      error,
    });
  }
};

// GET - Get all categories
export const getCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).send({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching categories",
      error,
    });
  }
};

// PUT - Update a category by ID
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;
    const categoryId = req.params.id;

    const category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    // Update name
    if (name) {
      category.name = name;
    }

    // Update image
    if (image) {
      // Remove old image from Cloudinary
      if (category.image.public_id) {
        await cloudinary.v2.uploader.destroy(category.image.public_id);
      }

      // Upload new image
      const file = getDataUri(image);
      const result = await cloudinary.v2.uploader.upload(file.content);

      category.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Save updates
    const updatedCategory = await category.save();

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating category",
      error,
    });
  }
};

// DELETE - Delete a category by ID
export const deleteCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Remove image from Cloudinary
    if (category.image.public_id) {
      await cloudinary.v2.uploader.destroy(category.image.public_id);
    }

    await category.deleteOne();

    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
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
      message: "Error in deleting category",
      error,
    });
  }
};

