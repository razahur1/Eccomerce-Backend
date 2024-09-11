import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// POST - Add item to cart
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Assuming the user is logged in

    // Validate product
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Find cart for the user
    let cart = await cartModel.findOne({ user: userId });

    // If no cart, create a new one
    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    // Check if the product is already in the cart
    const cartItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      // If product exists in the cart, update the quantity
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      // Else, add the new product to the cart
      cart.items.push({ product: productId, quantity });
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
    const { productId } = req.body;
    const userId = req.user._id;
    
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

    // Filter out the product to be removed
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
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
      return res.status(400).send({ error: "Quantity must be greater than zero" });
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
