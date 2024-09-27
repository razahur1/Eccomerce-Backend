import wishlistModel from "../models/wishlistModel.js";
import productModel from "../models/productModel.js";

// POST - Add product to wishlist
export const addToWishlistController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Validate product
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Find user's wishlist or create a new one
    let wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new wishlistModel({ user: userId, products: [] });
    }

    // Check if the product is already in the wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).send({
        error: "Product is already in your wishlist",
      });
    }

    // Add product to wishlist
    wishlist.products.push(productId);

    await wishlist.save();

    res.status(200).send({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding product to wishlist",
      error,
    });
  }
};

// GET - Get user's wishlist
export const getWishlistController = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await wishlistModel
      .findOne({ user: userId })
      .populate("products");

    if (!wishlist) {
      return res.status(404).send({ error: "Wishlist not found" });
    }

    res.status(200).send({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching wishlist",
      error,
    });
  }
};

// DELETE - Remove product from wishlist
export const removeFromWishlistController = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Find user's wishlist
    const wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).send({ error: "Wishlist not found" });
    }
    // Check if the product is already in the wishlist
    if (!wishlist.products.includes(productId)) {
      return res.status(400).send({
        error: "Product is not in your wishlist",
      });
    }
    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).send({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error removing product from wishlist",
      error,
    });
  }
};
