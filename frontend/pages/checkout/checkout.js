import ENDPOINTS from "../../assets/js/config.js";
import { checkUserAuth, getToken } from "../../assets/js/auth.js";
import { fetchCartItem } from "../../assets/js/api.js";
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

document.addEventListener("DOMContentLoaded", function () {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
  }
  const token = getToken();

  const checkoutItemsContainer = document.getElementById("checkout-items-container");

  async function fetchCheckoutItems() {
    const items = await fetchCartItem();
    if (items.length !== 0) {
      renderCheckoutItems(items);
    } else {
      checkoutItemsContainer.innerHTML = `<p>No items in the cart</p>`;
    }
  }

  function renderCheckoutItems(items) {
    checkoutItemsContainer.innerHTML = "";
    items.forEach((item) => {
      checkoutItemsContainer.innerHTML += `
          <li class="list-group-item p-3">
            <div class="row g-2">
              <div class="col-3 col-md-2 position-relative">
                <a href="${item.product.images[0].url}" target="_blank">
                  <img
                    src="${item.product.images[0].url}"
                    alt="${item.product.name}"
                    class="img-thumbnail"
                  />
                  <span
                    class="position-absolute top-0 end-0 p-1 bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center"
                    style="
                      width: 24px;
                      height: 24px;
                      margin-top: -8px;
                      margin-right: -8px;
                      font-size: 11px
                    "
                  >
                    ${item.quantity}
                  </span>
                </a>
              </div>

              <div class="col" style="margin-left: 15px">
                <div class="fw-600">
                  <a class="text-mode" href="../product/product-details.html?productId=${
                    item.product._id
                  }">
                    ${item.product.name}
                  </a>
                </div>
                <div class="d-flex align-items-center">
                  <span class="fs-sm">Size: ${item.size}</span>
                  <span class="ms-auto text-body">${
                    item.product.highlights.sale
                      ? formatPrice(item.product.salePrice)
                      : formatPrice(item.product.price)
                  }</span>
                </div>
              </div>
            </div>
          </li>
      `;
    });
  }

  fetchCheckoutItems();

  

});
