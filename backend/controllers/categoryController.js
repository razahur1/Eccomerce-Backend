import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

// POST - Add a new category
export const addCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ error: "Category name is required" });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await new categoryModel({
      name,
    }).save();

    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({
      success: false,
      message: "Error in creating category",
      error,
    });
  }
};

// GET - Get all categories with product count
export const getCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find().lean(); // Fetch all categories

    // Get product count for each category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await productModel.countDocuments({
          category: category._id,
        });
        return {
          ...category,
          productCount, // Add product count to the category
        };
      })
    );

    res.status(200).send({
      success: true,
      categories: categoriesWithProductCount,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching categories",
      error,
    });
  }
};

// PUT - Update a category by ID
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.id;

    const category = await categoryModel.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }

    if (name) {
      category.name = name;
    }

    const updatedCategory = await category.save();

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
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
    const categoryId = req.params.id;
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Check if any products are associated with this category
    const productCount = await productModel.countDocuments({
      category: categoryId,
    });
    if (productCount > 0) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete category. There are ${productCount} products associated with this category.`,
      });
    }

    // Proceed to delete the category
    await category.deleteOne();

    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid category ID",
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
