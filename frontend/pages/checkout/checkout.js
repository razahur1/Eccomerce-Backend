import ENDPOINTS from "../../assets/js/config.js";
import { checkUserAuth, getToken } from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  showError,
  showConfirm,
  formatPrice,
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
} from "../../assets/js/utils.js";
import { fetchCartItem, fetchAddresses } from "../../assets/js/api.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
  }

  const token = getToken();
  const checkoutItemsContainer = document.getElementById(
    "checkout-items-container"
  );
  const savedAddressContainer = document.getElementById(
    "savedAddressContainer"
  );
  const loadUtilsOnInit =
    "https://cdn.jsdelivr.net/npm/intl-tel-input@24.6.0/build/js/utils.js";
  const mobileInput = document.querySelector("#checkout-mobileNumber");
  if (mobileInput) {
    let iti = window.intlTelInput(mobileInput, {
      loadUtilsOnInit,
      initialCountry: "pk",
    });
  }

  let savedAddresses = [];
  let cartItems = [];
  let shippingCost = 0;

  async function initCheckout() {
    cartItems = await fetchCartItem();
    cartItems.length
      ? renderCheckoutItems(cartItems)
      : (checkoutItemsContainer.innerHTML = `<p>No items in the cart</p>`);
    updateOrderSummary(cartItems);

    savedAddresses = await fetchAddresses();
    savedAddresses.length
      ? renderSavedAddress(savedAddresses)
      : (savedAddressContainer.innerHTML = `<p>No saved address, Please add a new address</p>`);
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

  function renderSavedAddress(addresses) {
    savedAddressContainer.innerHTML = addresses
      .map(
        (address) => `
      <div class="form-check mb-3 pb-2">
        <input class="form-check-input" type="radio" name="savedAddress" id="savedAddress${
          address._id
        }" value="${address._id}" />
        <label class="form-check-label border w-100 p-2 bg-gray-100" for="savedAddress${
          address._id
        }">
          ${address.firstName} ${address.lastName}, ${address.addressLine1} ${
          address.addressLine2 ? `${address.addressLine2},` : ""
        } 
          ${address.city}, ${address.postalCode}, ${address.country}
        </label>
      </div>
    `
      )
      .join("");
  }

  function updateOrderSummary(items) {
    const subtotal = calculateSubtotal(items);
    const tax = Math.floor(calculateTax(subtotal));
    const grandTotal = calculateGrandTotal(subtotal, tax, shippingCost);

    // Update the subtotal, tax, and grand total in the DOM
    document.querySelector(".subtotal-display").textContent =
      formatPrice(subtotal);
    document.querySelector(".tax-display").textContent = formatPrice(tax);

    // Display "Enter shipping address" or the calculated shipping cost
    const shippingElement = document.querySelector(".shipping-display");
    if (shippingCost > 0) {
      shippingElement.textContent = formatPrice(shippingCost);
    } else {
      shippingElement.textContent = "Enter shipping address";
    }

    document.querySelector(".grand-total-display").textContent =
      formatPrice(grandTotal);
  }

  document
    .getElementById("savedAddressContainer")
    .addEventListener("change", (event) => {
      if (event.target.name === "savedAddress") {
        const selectedId = event.target.value;
        const selectedAddress = savedAddresses.find(
          (addr) => addr._id === selectedId
        );

        if (selectedAddress) {
          console.log(`Selected Country: ${selectedAddress.country}`);
          console.log(`Selected City: ${selectedAddress.city}`);
          shippingCost = calculateShippingCost(
            selectedAddress.country,
            selectedAddress.city
          );
          updateOrderSummary(cartItems);
        }
      }
    });

  document
    .getElementById("addNewAddress")
    .addEventListener("change", function () {
      if (this.checked) {
        document
          .getElementById("checkout-country")
          .addEventListener("input", handleAddressChange);
        document
          .getElementById("checkout-city")
          .addEventListener("input", handleAddressChange);
      }
    });

  function handleAddressChange() {
    const country = document.getElementById("checkout-country").value.trim();
    const city = document.getElementById("checkout-city").value.trim();

    if (country && city) {
      console.log(`Entered Country: ${country}`);
      console.log(`Entered City: ${city}`);
      shippingCost = calculateShippingCost(country, city);
      updateOrderSummary(cartItems);
    } else {
      shippingCost = 0;
      updateOrderSummary(cartItems);
    }
  }

  function calculateShippingCost(country, city) {
    country = country.toLowerCase();
    city = city.toLowerCase();

    if (country === "pakistan") {
      return city === "karachi" ? 200 : 350;
    }
    return 500;
  }

  initCheckout();

  // Function to save the address to the database
  async function saveAddressToDb(addressData) {
    try {
      const response = await fetch(ENDPOINTS.ADD_ADDRESS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify(addressData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  document
    .getElementById("placeOrderButton")
    .addEventListener("click", async function () {
      const savedAddressRadio =
        document.getElementById("savedAddresses").checked;
      const selectedSavedAddressRadio = document.querySelector(
        'input[name="savedAddress"]:checked'
      );

      const firstName = document
        .getElementById("checkout-firstName")
        .value.trim();
      const lastName = document
        .getElementById("checkout-lastName")
        .value.trim();
      const country = document.getElementById("checkout-country").value.trim();
      const city = document.getElementById("checkout-city").value.trim();
      const postalCode = document
        .getElementById("checkout-postalCode")
        .value.trim();
      const line1 = document
        .getElementById("checkout-addressLine1")
        .value.trim();
      const line2 = document
        .getElementById("checkout-addressLine2")
        .value.trim();
      const savedChecked = document.getElementById(
        "checkout-saveAddress"
      ).checked;
      let addressData;

      // Select saved Address
      if (savedAddressRadio && selectedSavedAddressRadio) {
        const selectedId = savedAddressRadio.value;
        addressData = savedAddresses.find((addr) => addr._id === selectedId);

        if (addressData) {
          console.log("Using selected saved address:", addressData);
        }
      }
      // Add new Address
      else {
        document.getElementById("addNewAddress").checked = true;
        document.getElementById("addNewAddressCollapse").classList.add("show");
        const inputsToValidate = [
          { id: "checkout-mobileNumber", label: "Mobile Phone" },
          { id: "checkout-firstName", label: "First Name" },
          { id: "checkout-lastName", label: "Last Name" },
          { id: "checkout-country", label: "Country" },
          { id: "checkout-city", label: "City" },
          { id: "checkout-postalCode", label: "ZIP / Postcode" },
          { id: "checkout-addressLine1", label: "Address Line 1" },
        ];

        let isValid = true;

        // Validate each input and apply/remove the 'input-error' class
        inputsToValidate.forEach((input) => {
          const element = document.getElementById(input.id);
          if (element.value.trim() === "") {
            element.classList.add("input-error");
            isValid = false;
          } else {
            element.classList.remove("input-error");
          }
        });

        if (!isValid) {
          showToast("Please fill in all required fields.");
          return;
        }

        addressData = {
          firstName,
          lastName,
          addressLine1: line1,
          addressLine2: line2,
          postalCode,
          city,
          country,
          isDefault: false,
        };

        if (savedChecked) {
          const result = await saveAddressToDb(addressData);
          console.log("Address saved to the database:", result);
        } else {
          console.log("Failed to save the address.");
          return;
        }
      }

      // Check if the number is valid
      const mobileNumber = mobileInput.value.trim();
      let iti = window.intlTelInput(mobileInput, {
        loadUtilsOnInit,
        initialCountry: "pk",
      });
      if (!iti.isValidNumber()) {
        showToast("Mobile number is invalid");
        return;
      }

      // Selected Payment Method
      const selectedPaymentMethod = document.querySelector(
        'input[name="payment"]:checked'
      );
      if (selectedPaymentMethod) {
        console.log(selectedPaymentMethod.value);
      } else {
        console.log("no selected");
        return;
      }

      try {
        console.log("Placing order...");
      } catch (error) {
        showToast("Failed to place the order.");
        console.error(error);
      }
    });
});
