import ENDPOINTS from "../../assets/js/config.js";
import { checkUserAuth, getToken } from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  showConfirm,
  formatPrice,
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
} from "../../assets/js/utils.js";
import { fetchCartItem } from "../../assets/js/api.js";

document.addEventListener("DOMContentLoaded", function () {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
  }

  const cartItemsContainer = document.getElementById("cart-items-container");
  const token = getToken();

  let items = [];

  async function fetchCart() {
    items = await fetchCartItem();
    if (items.length !== 0) {
      renderCartItems(items);
      updateCartSummary(items);
    } else {
      cartItemsContainer.innerHTML = `<p>No items in the cart</p>`;
      updateCartSummary([]);
    }
  }

  // Render cart items dynamically
  function renderCartItems(items) {
    cartItemsContainer.innerHTML = "";
    items.forEach((item) => {
      let customSize =
        item.size.label === "CUSTOM" ? item.size.customSize : null;

      cartItemsContainer.innerHTML += `
        <div class="d-flex align-items-center flex-row w-100 pb-3 mb-3 border-bottom">
          <a class="d-inline-block flex-shrink-0 me-3" href="${
            item.product.images[0].url
          }" target="_blank">
            <img 
              src="${item.product.images[0].url}" 
              width="120" 
              alt="${item.product.name}" 
              class="img-fluid" 
            />
          </a>
          <div class="d-flex flex-column flex-sm-row col">
            <div class="pe-sm-2">
              <h3 class="product-title fs-5 mb-1">
                <a class="text-reset" href="../product/product-details.html?productId=${
                  item.product._id
                }">${item.product.name}</a>
              </h3>
              <div class="small">
                <span class="text-muted me-2">Size:</span>${item.size.label}
              </div>
              ${
                item.size.label === "CUSTOM" && item.size.customSize
                  ? `
                  <div class="small">
                    <span class="text-muted me-2">Measurements:</span>
                    <ul>
                      ${Object.entries(item.size.customSize)
                        .map(
                          ([key, value]) => `
                        <li><strong>${key}:</strong> ${value}  <small>inches</small></li>
                      `
                        )
                        .join("")}
                    </ul>
                  </div>
                `
                  : ""
              }
              <div class="lead pt-1">
                ${
                  item.product.highlights.sale
                    ? formatPrice(item.product.salePrice)
                    : formatPrice(item.product.price)
                }
              </div>
            </div>
            <div class="pt-2 pt-sm-0 d-flex d-sm-block ms-sm-auto">
              <label class="form-label d-none d-sm-inline-block">Quantity</label>
              <div class="cart-qty-01">
                <div class="dec qty-btn qty_btn" data-id="${
                  item.product._id
                }" data-size="${item.size.label}" >-</div>
                <input class="cart-qty-input form-control" type="text" name="qtybutton" value="${
                  item.quantity
                }" />
                <div class="inc qty-btn qty_btn" data-id=${
                  item.product._id
                } data-size="${item.size.label}" >+</div>
              </div>
              <button class="btn btn-link px-0 text-danger ms-auto" type="button" data-id="${
                item.product._id
              }" data-size="${item.size.label}">
                <i class="bi-trash3 me-2"></i><span>Remove</span>
              </button>
              <input type="hidden" name="customSize" value=
                '${JSON.stringify(customSize)}'/>
            </div>
          </div>
        </div>
         
      `;
    });

    attachEventListeners();
  }

  // Attach event listeners for quantity update and removal
  function attachEventListeners() {
    const qtyButtons = document.querySelectorAll(".qty-btn");
    qtyButtons.forEach((btn) => {
      btn.addEventListener("click", updateQuantity);
    });

    const removeButtons = document.querySelectorAll(".text-danger");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", removeItem);
    });

    const updateButton = document.getElementById("update-cart-btn");
    updateButton.addEventListener("click", fetchCart);
  }

  // Update quantity
  async function updateQuantity(e) {
    const productId = e.currentTarget.dataset.id;
    const size = e.currentTarget.dataset.size;

    // Retrieve customSize from the hidden input field
    const customSizeInput =
      e.currentTarget.parentElement.parentElement.querySelector(
        'input[name="customSize"]'
      );
    const customSize = JSON.parse(customSizeInput.value);

    const input =
      e.currentTarget.parentElement.querySelector(".cart-qty-input");
    let quantity = parseInt(input.value);

    if (e.currentTarget.classList.contains("dec") && quantity > 1) {
      quantity--;
    } else if (e.currentTarget.classList.contains("inc")) {
      quantity++;
    }

    input.value = quantity;

    try {
      const response = await fetch(ENDPOINTS.UPDATE_CART, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          size: { label: size, customSize: customSize },
          quantity,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showToast("Cart item is successfully update", "success");
        fetchCart();
      } else {
        showToast(result.error, "warning");
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  }

  // Remove item from cart
  async function removeItem(e) {
    const productId = e.currentTarget.dataset.id;
    const size = e.currentTarget.dataset.size;

    const customSizeInput =
      e.currentTarget.parentElement.parentElement.querySelector(
        'input[name="customSize"]'
      );
    const customSize = JSON.parse(customSizeInput.value);

    const userConfirmed = await showConfirm(
      "Do you want to remove item from cart?"
    );
    if (!userConfirmed) {
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.REMOVE_FROM_CART, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          size: { label: size, customSize: customSize },
        }),
      });
      const result = await response.json();
      if (result.success) {
        showToast("Item is successfully removed from cart", "success");
        fetchCart();
      } else {
        showToast(result.error, "warning");
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  }

  // Function to update the cart summary display
  function updateCartSummary(items) {
    const subtotal = calculateSubtotal(items);
    const tax = Math.floor(calculateTax(subtotal));
    const grandTotal = calculateGrandTotal(subtotal, tax);

    // Update the subtotal, tax, and grand total in the DOM
    document.querySelector(".subtotal-display").textContent = `${formatPrice(
      subtotal
    )}`;
    document.querySelector(".tax-display").textContent = `${formatPrice(tax)}`;
    document.querySelector(".grand-total-display").textContent = `${formatPrice(
      grandTotal
    )}`;
  }

  window.checkCartItems = async function () {
    if (items.length === 0) {
      showToast(
        "Your cart is empty. Please add items to your cart before proceeding to checkout.",
        "warning"
      );
    } else {
      window.location.href = "../checkout/checkout.html";
    }
  };

  // Initial fetch
  fetchCart();
});
