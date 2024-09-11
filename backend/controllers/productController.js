import productModel from "../models/productModel.js";
import { getDataUri } from "../helpers/dataUriHelper.js";
import cloudinary from "../config/cloudinary.js";

// POST - Add a new product        //pagination and fiter baki ha
export const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      gender,
      sizes,
      isOnSale,
      salePrice,
      isBestSelling,
    } = req.body;
    const images = req.files;

    // if (!name || !description || !price || !category || !gender || !sizes) {
    //   return res
    //     .status(400)
    //     .send({ error: "All required fields must be filled" });
    // }

    // Upload product images to Cloudinary
    let uploadedImages = [];
    if (!images || images.length === 0) {
      return res.status(500).send({
        success: false,
        message: "Please Upload Product Image",
      });
    }

    for (const image of images) {
      const file = getDataUri(image);
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      uploadedImages.push({
        public_id: cdb.public_id,
        url: cdb.secure_url,
      });
    }

    const product = await new productModel({
      name,
      description,
      price,
      category,
      tags,
      gender,
      sizes, //: JSON.parse(sizes),
      isOnSale,
      salePrice,
      isBestSelling,
      images: uploadedImages,
    }).save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating product",
      error,
    });
  }
};

// GET - Get all products
export const getProductsController = async (req, res) => {
  try {
    const products = await productModel.find().populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error,
    });
  }
};

// GET - Get products by specific category ID
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel
      .find({ category: categoryId })
      .populate("category");

    if (products.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No products found for this category",
      });
    }

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products by category",
      error,
    });
  }
};

// GET - Get a single product by ID
export const getProductByIdController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("category")
      .populate("reviews");
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching product",
      error,
    });
  }
};

// GET - Get top 10 rated products
export const getTopRatedProductsController = async (req, res) => {
  try {
    // Find the top 10 products based on ratingsAverage
    const topRatedProducts = await productModel
      .find()
      .sort({ ratingsAverage: -1 }) // Sort by ratingsAverage in descending order
      .limit(10); // Limit to 5 products

    res.status(200).send({
      success: true,
      message: "Top 5 rated products fetched successfully",
      products: topRatedProducts,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching top rated products",
      error,
    });
  }
};

// GET - Get top 10 new products by date
export const getNewProductsController = async (req, res) => {
  try {
    const newProducts = await productModel
      .find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); // Limit to 10 products

    res.status(200).send({
      success: true,
      message: "New products fetched successfully",
      products: newProducts,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching new products",
      error,
    });
  }
};

// GET - Get top 10 best selling products
export const getBestSellingProductsController = async (req, res) => {
  try {
    const bestSellingProducts = await productModel
      .find({ isBestSelling: true }) // Filter by isBestSelling
      .sort({ ratingsCount: -1 }) // You could also sort by the number of sales if you have a `salesCount` field
      .limit(10); // Limit to 10 products

    res.status(200).send({
      success: true,
      message: "Best-selling products fetched successfully",
      products: bestSellingProducts,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching best-selling products",
      error,
    });
  }
};

// PUT - Update a product by ID
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      gender,
      sizes,
      isOnSale,
      salePrice,
      isBestSelling,
    } = req.body;
    const images = req.files;

    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Update product details
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.tags - tags || product.tags;
    product.gender = gender || product.gender;
    product.sizes = sizes || product.sizes;
    // product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
    product.isBestSelling =
      isBestSelling !== undefined ? isBestSelling : product.isBestSelling;
    product.isOnSale = isOnSale !== undefined ? isOnSale : product.isOnSale;
    product.salePrice = salePrice || product.salePrice;

    // Upload new images to Cloudinary if provided
    if (images && images.length > 0) {
      let uploadedImages = [];
      for (const image of images) {
        const file = getDataUri(image);
        const cdb = await cloudinary.v2.uploader.upload(file.content);
        uploadedImages.push({
          public_id: cdb.public_id,
          url: cdb.secure_url,
        });
      }
      product.images = uploadedImages;
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error,
    });
  }
};

// DELETE - Delete a product by ID
export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.v2.uploader.destroy(image.public_id);
      }
    }

    await product.deleteOne();

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error,
    });
  }
};

// POST - Add product images
export const addProductImagesController = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = req.files;

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check the current number of images
    if (product.images.length >= 5) {
      return res.status(400).send({
        success: false,
        message: "Cannot add more than 5 images to a product",
      });
    }

    // Ensure that adding the new images does not exceed the limit of 5
    const totalImages = product.images.length + images.length;
    if (totalImages > 5) {
      return res.status(400).send({
        success: false,
        message: `Adding these images exceeds the 5 image limit. You can only add ${
          5 - product.images.length
        } more image(s).`,
      });
    }

    // Upload new images to Cloudinary
    let uploadedImages = [];
    for (const image of images) {
      const file = getDataUri(image);
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      uploadedImages.push({
        public_id: cdb.public_id,
        url: cdb.secure_url,
      });
    }

    // Update the product's images array
    product.images.push(...uploadedImages);
    await product.save();

    res.status(200).send({
      success: true,
      message: "Image(s) added successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding image to product",
      error,
    });
  }
};

// POST - add product single image
export const addSingleProductImageController = async (req, res) => {
  try {
    const { productId } = req.params;
    const image = req.file; // Use `req.file` for single image upload

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the product already has 5 images
    if (product.images.length >= 5) {
      return res.status(400).send({
        success: false,
        message: "Cannot add more than 5 images to a product",
      });
    }

    // Check if an image was provided
    if (!image) {
      return res.status(400).send({
        success: false,
        message: "Please upload an image",
      });
    }

    // Upload the image to Cloudinary
    const file = getDataUri(image);
    const uploadedImage = await cloudinary.v2.uploader.upload(file.content);

    // Add the image to the product
    product.images.push({
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    });

    // Save the updated product
    await product.save();

    res.status(200).send({
      success: true,
      message: "Image added successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding image to product",
      error,
    });
  }
};

// DELETE - delete product image
export const deleteProductImageController = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Find the image to delete by its public_id
    const image = product.images.find((img) => img.public_id === imageId);
    if (!image) {
      return res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    // Delete the image from Cloudinary
    await cloudinary.v2.uploader.destroy(image.public_id);

    // Remove the image from the product's images array
    product.images = product.images.filter((img) => img.public_id !== imageId);
    await product.save();

    res.status(200).send({
      success: true,
      message: "Image deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting image",
      error,
    });
  }
};

// POST - Add a review for a product
export const addProductReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;
    // Validate input
    if (!rating || !comment) {
      return res
        .status(400)
        .send({ error: "Rating and comments are required" });
    }

    // Check if the product exists
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Check if the user has already reviewed this product
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).send({ error: "Review already exists" });
    }

    // Create and save the new review
    const newReview = {
      user: userId,
      rating,
      comment,
    };

    product.reviews.push(newReview);
    product.ratingsCount += 1;
    product.ratingsAverage =
      (product.ratingsAverage * (product.ratingsCount - 1) + rating) /
      product.ratingsCount;

    await product.save();

    res.status(201).send({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding review",
      error,
    });
  }
};

// GET - Get all reviews for a product
export const getProductReviewController = async (req, res) => {
  try {
    const { productId } = req.params.id;

    // Check if the product exists
    const product = await productModel.findById(req.params.id).populate("reviews.user");
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.status(200).send({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching reviews",
      error,
    });
  }
};
