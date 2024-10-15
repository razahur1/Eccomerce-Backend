import ENDPOINTS from "./config.js";
import { showToast, showSpinner, hideSpinner } from "./utils.js";
import { checkUserAuth } from "./auth.js";

// Function to add a product to the cart
export const addToCart = async (productId, quantity = 1, token) => {
  if (!checkUserAuth()) {
    showToast("Please Login First....!", "warning");
    return;
  }

  // Use the correct name attribute to find the selected size
  const selectedSize = document.querySelector(
    `input[name="size_${productId}"]:checked`
  );

  if (!selectedSize) {
    showToast("Please select a size before adding to the cart.", "warning");
    return;
  }

  const size = selectedSize.value;

  try {
    showSpinner();
    const response = await fetch(`${ENDPOINTS.ADD_TO_CART}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
      body: JSON.stringify({ productId, quantity, size }),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Product added to cart", "success");
    } else {
      showToast(result.error, "warning");
    }
  } catch (error) {
    showToast("Error adding product to cart: " + error, "danger");
  } finally {
    hideSpinner();
  }
};

// Function to add a product to the wishlist
export const addToWishlist = async (productId, token) => {
  if (!checkUserAuth()) {
    showToast("Please Login First....!", "warning");
    return;
  }

  try {
    showSpinner();
    const response = await fetch(`${ENDPOINTS.ADD_TO_WISHLIST}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Product added to your wishlist", "success");
    } else {
      showToast(result.error, "warning");
    }
  } catch (error) {
    showToast("Error adding product to wishlist: " + error, "danger");
  } finally {
    hideSpinner();
  }
};