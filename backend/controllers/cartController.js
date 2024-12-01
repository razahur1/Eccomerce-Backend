import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// POST - Add item to cart
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const userId = req.user._id;

    // Validate product
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Validate size
    if (!size || !size.label) {
      return res.status(400).send({ error: "Please select size first." });
    }

    const customSize = size.customSize ?? null;

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    // Check if the product with the same size.label and customSize is already in the cart
    const cartItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size.label === size.label &&
        item.size.customSize === customSize
    );

    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size: { label: size.label, customSize },
      });
    }

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error adding product to cart",
      error: error.message, // Send the actual error message
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

    // Check that size is passed correctly
    if (!size || !size.label) {
      return res.status(400).send({ error: "Invalid size data" });
    }

    // Find the cart item
    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size.label === size.label &&
        JSON.stringify(item.size.customSize) === JSON.stringify(size.customSize)
    );

    if (!cartItem) {
      return res.status(404).send({ error: "Product not found in cart" });
    }

    // Filter out the product to be removed
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.size.label === size.label &&
          JSON.stringify(item.size.customSize) ===
            JSON.stringify(size.customSize)
        )
    );

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
};

// PUT - Update quantity of a cart item
export const updateCartItemController = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
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

    // Find the cart item with matching productId and size
    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size.label === size.label &&
        JSON.stringify(item.size.customSize) === JSON.stringify(size.customSize)
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
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

// PUT - Update quantity of multiple cart items
export const updateMulipleCartItemsController = async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }
    const userId = req.user._id;

    // Validate input: ensure items is an array and contains valid data
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        error:
          "Invalid input. Provide an array of items with productId and quantity.",
      });
    }

    // Find user's cart
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    // Iterate through each item and update its quantity
    for (const { productId, quantity } of items) {
      if (quantity <= 0) {
        return res
          .status(400)
          .send({ error: "Quantity must be greater than zero for all items" });
      }

      // Find the cart item
      const cartItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (!cartItem) {
        return res
          .status(404)
          .send({ error: `Product with ID ${productId} not found in cart` });
      }

      // Update the quantity
      cartItem.quantity = quantity;
    }

    // Save the cart after updating all items
    await cart.save();

    res.status(200).send({
      success: true,
      message: "Cart items updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating cart items",
      error,
    });
  }
};
