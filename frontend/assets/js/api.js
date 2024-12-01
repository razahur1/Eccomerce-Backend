import ENDPOINTS from "./config.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  validateCustomSizeChart,
  clearCustomSizeForm,
} from "./utils.js";
import { checkUserAuth, getToken } from "./auth.js";

const token = getToken();

// Function to add a product to the cart
export const addToCart = async (productId, quantity = 1, customSize = null) => {
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

  const size = selectedSize ? selectedSize.value : null;

  if (!size) {
    showToast("Please select a valid size.", "warning");
    return;
  }

  if (size === "CUSTOM") {
    const { isValid, formData } = validateCustomSizeChart(
      "px_custom_size_chart_modal"
    );
    if (!isValid) {
      showToast("Please fill out all fields with positive values.");
      return;
    }
    customSize = formData;
  }

  try {
    showSpinner();
    const response = await fetch(`${ENDPOINTS.ADD_TO_CART}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
        quantity,
        size: { label: size, customSize },
      }),
    });
    const result = await response.json();
    if (result.success) {
      showToast("Product Added to your Cart Successfully", "success");
      clearCustomSizeForm();
      GetWishlistAndCartCounts();
    } else {
      showToast(result.message, "warning");
    }
  } catch (error) {
    showToast("Error adding product to cart: " + error.message, "danger");
  } finally {
    hideSpinner();
  }
};

// Function to add a product to the wishlist
export const addToWishlist = async (productId) => {
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
      GetWishlistAndCartCounts();
    } else {
      showToast(result.error, "warning");
    }
  } catch (error) {
    showToast("Error adding product to wishlist: " + error, "danger");
  } finally {
    hideSpinner();
  }
};

export const fetchCartItem = async () => {
  if (!checkUserAuth()) {
    showToast("Please Login First....!", "warning");
    return;
  }
  try {
    showSpinner();
    const response = await fetch(ENDPOINTS.GET_CART, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      return data.cart.items;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  } finally {
    hideSpinner();
  }
};

export const fetchAddresses = async () => {
  if (!checkUserAuth()) {
    showToast("Please Login First....!", "warning");
    return;
  }
  try {
    showSpinner();
    const response = await fetch(ENDPOINTS.GET_ADDRESSES, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        Authorization: token,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      return data.addresses;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  } finally {
    hideSpinner();
  }
};

export const GetWishlistAndCartCounts = async () => {
  const wishlistCountElement = document.querySelector(".fi-heart + sub");
  const cartCountElement = document.querySelector(".fi-shopping-cart + sub");

  const wishlistCountMobile = document.querySelector(".mobile-heart + sub");
  const cartCountMobile = document.querySelector(".mobile-cart + sub");

  try {
    const response = await fetch(ENDPOINTS.GET_USER_COUNT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      wishlistCountElement
        ? (wishlistCountElement.textContent = data.wishlistCount)
        : null;
      cartCountElement ? (cartCountElement.textContent = data.cartCount) : null;
      wishlistCountMobile
        ? (wishlistCountMobile.textContent = data.wishlistCount)
        : null;
      cartCountMobile ? (cartCountMobile.textContent = data.cartCount) : null;
    }
  } catch (error) {
    console.error("Error fetching user count:", error);
  }
};
