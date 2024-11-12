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

  async function fetchCart() {
    const items = await fetchCartItem();
    if(items.length !== 0 ){
      renderCartItems(items);
      updateCartSummary(items);
    }
    else {
      cartItemsContainer.innerHTML = `<p>No items in the cart</p>`;
      updateCartSummary([]);
    }
  }

  // Render cart items dynamically
  function renderCartItems(items) {
    cartItemsContainer.innerHTML = "";
    items.forEach((item) => {
      cartItemsContainer.innerHTML += `
          <div class="d-flex align-items-center flex-row w-100 pb-3 mb-3 border-bottom">
            <a class="d-inline-block flex-shrink-0 me-3" href="${
              item.product.images[0].url
            }" target="_blank" >
              <img src="${item.product.images[0].url}" width="120" alt="${
        item.product.name
      }" />
            </a>
            <div class="d-flex flex-column flex-sm-row col">
              <div class="pe-sm-2">
                <h3 class="product-title fs-5 mb-1">
                  <a class="text-reset"  href="../product/product-details.html?productId=${
                    item.product._id
                  }" >${item.product.name}</a>
                </h3>
                <div class="small">
                  <span class="text-muted me-2">Size:</span>${item.size}
                </div>
                <div class="lead pt-1">${
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
                  }" data-size="${item.size}">-</div>
                  <input class="cart-qty-input form-control" type="text" name="qtybutton" value="${
                    item.quantity
                  }" />
                  <div class="inc qty-btn qty_btn" data-id="${
                    item.product._id
                  }" data-size="${item.size}">+</div>
                </div>
                <button class="btn btn-link px-0 text-danger ms-auto" type="button" data-id="${
                  item.product._id
                }" data-size="${item.size}">
                  <i class="bi-trash3 me-2"></i><span>Remove</span>
                </button>
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
      await fetch(ENDPOINTS.UPDATE_CART, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({ productId, size, quantity }),
      });
      showToast("Cart item is successfully update", "success");
      fetchCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  }

  // Remove item from cart
  async function removeItem(e) {
    const productId = e.currentTarget.dataset.id;
    const size = e.currentTarget.dataset.size;

    const userConfirmed = await showConfirm(
      "Do you want to remove item from cart?"
    );
    if (!userConfirmed) {
      return;
    }

    try {
      await fetch(ENDPOINTS.REMOVE_FROM_CART, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({ productId, size }),
      });
      showToast("Item is successfully removed from cart", "success");
      fetchCart();
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

  // Initial fetch
  fetchCart();
});
