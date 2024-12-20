import productModel from "../models/productModel.js";
import { getDataUri } from "../helpers/dataUriHelper.js";
import cloudinary from "../config/cloudinary.js";
import categoryModel from "../models/categoryModel.js";

// POST - Add Products
export const addProductController = async (req, res) => {
  try {
    const {
      name,
      intro,
      description,
      price,
      category,
      tags,
      gender,
      sizes,
      justIn,
      popular,
      valued,
      adored,
      trendy,
      sale,
      salePrice,
      saleEndDate,
    } = req.body;
    const images = req.files;

    // Validation: Ensure mandatory fields are filled
    if (
      !name ||
      !intro ||
      !description ||
      !price ||
      !category ||
      !gender ||
      !sizes
    ) {
      return res
        .status(400)
        .send({ error: "All required fields must be filled" });
    }

    const existingProduct = await productModel.findOne({ name });
    if (existingProduct) {
      return res.status(400).send({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Upload product images to Cloudinary
    let uploadedImages = [];
    if (!images || images.length === 0) {
      return res.status(500).send({
        success: false,
        message: "Please upload product images",
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

    // Create new product with relevant fields
    const product = await new productModel({
      name,
      intro,
      description,
      price,
      category: JSON.parse(category),
      tags,
      gender,
      sizes: JSON.parse(sizes),
      highlights: {
        justIn: justIn || false,
        popular: popular || false,
        valued: valued || false,
        adored: adored || false,
        trendy: trendy || false,
        sale: sale || false,
      },
      salePrice: salePrice || null,
      saleEndDate: saleEndDate || null,
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
      error: error.message,
    });
  }
};

// GET - Get all products
export const getProductsController = async (req, res) => {
  try {
    const {
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      justIn,
      popular,
      valued,
      adored,
      trendy,
      sale,
      page = 1,
      limit = 12,
    } = req.query;

    // Get the current date and time
    const currentDate = new Date();

    // Update products where the saleEndDate has passed
    await productModel.updateMany(
      { saleEndDate: { $lte: currentDate }, "highlights.sale": true },
      { $set: { "highlights.sale": false } }
    );

    // Base query object
    let queryObject = {};

    // Search by product name or tags
    if (search) {
      queryObject = {
        ...queryObject,
        $or: [
          { code: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Filter by category
    if (category) {
      const categoryDoc = await categoryModel.findOne({
        name: category.trim(),
      });
      if (categoryDoc) {
        queryObject.category = categoryDoc._id;
      } else {
        // If no matching category is found, return an empty result
        return res.status(200).send({
          success: true,
          products: [],
          totalProducts: 0,
          currentPage: Number(page),
          totalPages: 0,
        });
      }
    }

    // Filter by gender
    if (gender) {
      queryObject.gender = gender;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      queryObject.price = {};
      if (minPrice) {
        queryObject.price.$gte = minPrice;
      }
      if (maxPrice) {
        queryObject.price.$lte = maxPrice;
      }
    }

    // Filter by highlights
    const highlights = { justIn, popular, valued, adored, trendy, sale };
    for (const [key, value] of Object.entries(highlights)) {
      if (value) {
        queryObject[`highlights.${key}`] = value === "true";
      }
    }

    // Sort by price, ratingsAverage, or createdAt
    let sortObject = {};
    if (sortBy) {
      if (sortBy === "priceAsc") {
        sortObject.price = 1;
      } else if (sortBy === "priceDesc") {
        sortObject.price = -1;
      } else if (sortBy === "ratingsAverage") {
        sortObject.ratingsAverage = -1;
      } else if (sortBy === "newest") {
        sortObject.createdAt = -1;
      } else if (sortBy === "oldest") {
        sortObject.createdAt = 1;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch products with filters, search, highlights, sorting, and pagination
    const products = await productModel
      .find(queryObject)
      .populate("category")
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    // Get total count of products for pagination
    const totalProducts = await productModel.countDocuments(queryObject);

    res.status(200).send({
      success: true,
      products,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error,
    });
  }
};

// GET - Get a single product by ID
export const getProductByIdController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("category");
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

export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      intro,
      description,
      price,
      category,
      tags,
      gender,
      sizes,
      justIn,
      popular,
      valued,
      adored,
      trendy,
      sale,
      salePrice,
      saleEndDate,
    } = req.body;
    const images = req.files;

    // Find product by ID
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (product.name !== name) {
      const existingProduct = await productModel.findOne({ name });
      if (existingProduct) {
        return res.status(400).send({
          success: false,
          message: "Product with this name already exists",
        });
      }
    }

    // Update product details
    product.name = name || product.name;
    product.intro = intro || product.intro;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category ? JSON.parse(category) : product.category;
    product.tags = tags || product.tags;
    product.gender = gender || product.gender;
    product.sizes = sizes ? JSON.parse(sizes) : product.sizes; // Assuming sizes are passed as a JSON array

    // Update highlights
    product.highlights = {
      justIn: justIn !== undefined ? justIn : product.highlights.justIn,
      popular: popular !== undefined ? popular : product.highlights.popular,
      valued: valued !== undefined ? valued : product.highlights.valued,
      adored: adored !== undefined ? adored : product.highlights.adored,
      trendy: trendy !== undefined ? trendy : product.highlights.trendy,
      sale: sale !== undefined ? sale : product.highlights.sale,
    };

    // Update sale information
    product.salePrice = salePrice || product.salePrice;
    product.saleEndDate = saleEndDate || product.saleEndDate;

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
      product.images = product.images
        ? [...product.images, ...uploadedImages]
        : uploadedImages;
    }

    // Save updated product
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

// GET - Get related product (category and tags)
export const getRelatedProductsController = async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 6;

    // Find the current product by its ID and populate categories and tags
    const currentProduct = await productModel
      .findById(productId)
      .populate("category tags");

    if (!currentProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Define the query to find related products by matching categories or tags, excluding the current product
    const queryObject = {
      _id: { $ne: productId }, // Exclude the current product from related products
      $or: [
        { category: { $in: currentProduct.category } }, // Match based on categories
        { tags: { $in: currentProduct.tags } }, // Match based on tags
      ],
    };

    // Fetch related products, limiting to a set number (e.g., 10)
    const relatedProducts = await productModel
      .find(queryObject)
      .populate("category tags") // Populating tags as well
      .limit(limit);

    res.status(200).send({
      success: true,
      relatedProducts,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send({
      success: false,
      message: "Error fetching related products",
      error: error.message, // Return only the error message to avoid exposing sensitive information
    });
  }
};

// GET - Get New Arrivals
export const getNewArrivalsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Fetch products sorted by newest first
    const newArrivals = await productModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).send({
      success: true,
      newArrivals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching new arrivals",
      error: error.message,
    });
  }
};

// GET - Get Best Sellers
export const getBestSellersController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Fetch products sorted by ratings average and count
    const bestSellers = await productModel
      .find({})
      .sort({ ratingsAverage: -1, ratingsCount: -1 })
      .limit(limit);

    res.status(200).send({
      success: true,
      bestSellers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching best sellers",
      error: error.message,
    });
  }
};

export const getOutOfStockProductsController = async (req, res) => {
  try {
    const outOfStockProducts = await productModel.find({
      "sizes.stock": { $eq: 0 },
    });
    res.status(200).send({
      success: true,
      products: outOfStockProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching out of stock products",
      error: error.message,
    });
  }
};

// POST - Add review for a product
export const addProductReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).send({ error: "Rating and comment are required" });
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

    // Correctly calculate ratingsAverage
    const totalRatingSum = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    product.ratingsAverage = totalRatingSum / product.ratingsCount;

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
    const productId = req.params.id;
    const limit = parseInt(req.query.limit); // Get the limit from query parameters

    // Check if the product exists
    const product = await productModel
      .findById(productId)
      .populate("reviews.user");
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Sort reviews by date (newest first)
    const sortedReviews = product.reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Determine which reviews to return based on the limit
    const reviewsToReturn = limit
      ? sortedReviews.slice(0, limit)
      : sortedReviews;

    res.status(200).send({
      success: true,
      reviews: reviewsToReturn,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching reviews",
      error,
    });
  }
};
