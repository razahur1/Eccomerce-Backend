import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// POST - Add item to cart
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body; // Include size in the request body
    const userId = req.user._id;

    // Validate product
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Validate size
    if (!size) {
      return res.status(400).send({ error: "Please select size first." });
    }

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    // Check if the product with the same size is already in the cart
    const cartItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size }); // Add size to the cart item
    }

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding product to cart",
      error,
    });
  }
};

// GET - Get cart for the user
export const getCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product");

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    res.status(200).send({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching cart",
      error,
    });
  }
};

// Delete - Remove an item from the cart
export const removeFromCartController = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user._id;

    // Find user's cart
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    // Find the cart item
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (!cartItem) {
      return res.status(404).send({ error: "Product not found in cart" });
    }

    // Filter out the product to be removed
    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error removing product from cart",
      error,
    });
  }
};

// PUT - Update quantity of a cart item
export const updateCartItemController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .send({ error: "Quantity must be greater than zero" });
    }

    // Find user's cart
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    // Find the cart item
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).send({ error: "Product not found in cart" });
    }

    // Update the quantity
    cartItem.quantity = quantity;

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating cart item",
      error,
    });
  }
};
