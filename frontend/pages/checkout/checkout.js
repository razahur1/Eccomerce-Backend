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
  let subTotal,
    tax,
    shippingCost,
    totalAmount = 0;

  async function initCheckout() {
    cartItems = await fetchCartItem();
    renderCheckoutItems(cartItems);
    updateOrderSummary(cartItems);

    savedAddresses = await fetchAddresses();
    savedAddresses.length
      ? renderSavedAddress(savedAddresses)
      : (savedAddressContainer.innerHTML = `<p>No saved address, Please add a new address</p>`);
  }

  function renderCheckoutItems(items) {
    checkoutItemsContainer.innerHTML = "";
    if (items.length === 0) {
      window.location.href = "../shop/shop.html";
    } else {
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
                  <span class="fs-sm">Size: ${item.size.label}</span>
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
    subTotal = calculateSubtotal(items);
    tax = Math.floor(calculateTax(subTotal));
    totalAmount = calculateGrandTotal(subTotal, tax, shippingCost);

    // Update the subtotal, tax, and grand total in the DOM
    document.querySelector(".subtotal-display").textContent =
      formatPrice(subTotal);
    document.querySelector(".tax-display").textContent = formatPrice(tax);

    // Display "Enter shipping address" or the calculated shipping cost
    const shippingElement = document.querySelector(".shipping-display");
    if (shippingCost > 0) {
      shippingElement.textContent = formatPrice(shippingCost);
    } else {
      shippingElement.textContent = "Enter shipping address";
    }

    document.querySelector(".grand-total-display").textContent =
      formatPrice(totalAmount);
  }

  const savedAddressRadio = document.getElementById("savedAddresses");
  const addNewAddressRadio = document.getElementById("addNewAddress");

  // Calculate shipping cost if saved address is initially selected
  if (savedAddressRadio?.checked) {
    const selectedAddress = savedAddresses.find(
      (addr) =>
        addr._id ===
        document.querySelector('input[name="savedAddress"]:checked')?.value
    );
    if (selectedAddress)
      updateShippingCost(selectedAddress.country, selectedAddress.city);
  }

  // Set up address change listeners if "Add New Address" is selected
  if (addNewAddressRadio?.checked) setupAddressChangeListeners();

  // Event listener for saved address selection
  document
    .getElementById("savedAddressContainer")
    .addEventListener("change", (e) => {
      if (e.target.name === "savedAddress") {
        const selectedAddress = savedAddresses.find(
          (addr) => addr._id === e.target.value
        );
        if (selectedAddress)
          updateShippingCost(selectedAddress.country, selectedAddress.city);
      }
    });

  // Event listener for add new address selection
  addNewAddressRadio?.addEventListener("change", () =>
    setupAddressChangeListeners()
  );

  function setupAddressChangeListeners() {
    const countryInput = document.getElementById("checkout-country");
    const cityInput = document.getElementById("checkout-city");

    // Listen for changes in country and city input
    countryInput.addEventListener("input", handleAddressChange);
    cityInput.addEventListener("input", handleAddressChange);
    handleAddressChange(); // Calculate cost immediately if any values are pre-filled
  }

  function handleAddressChange() {
    const country = document.getElementById("checkout-country").value.trim();
    const city = document.getElementById("checkout-city").value.trim();
    if (country && city) updateShippingCost(country, city);
    else updateShippingCost("", "");
  }

  function updateShippingCost(country, city) {
    const cost = country && city ? calculateShippingCost(country, city) : 0;
    shippingCost = cost;
    updateOrderSummary(cartItems);
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
      showSpinner();
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
    } finally {
      hideSpinner();
    }
  }

  async function saveOrderToDb(orderData) {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.CREATE_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    } finally {
      hideSpinner();
    }
  }

  async function processPayFastPayment() {
    return { success: true };
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
        const selectedId = selectedSavedAddressRadio.value;
        addressData = savedAddresses.find((addr) => addr._id === selectedId);
      }
      // Add new Address
      else {
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
        };
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
      if (!selectedPaymentMethod) {
        showToast("Please Select Payment Method");
        return;
      }

      const paymentMethod = selectedPaymentMethod.value;

      // Prepare the order data
      const orderData = {
        shippingInfo: addressData,
        mobileNumber,
        paymentMethod,
        subTotal,
        tax,
        shippingCost,
        totalAmount,
      };

      try {
        showSpinner();
        if (paymentMethod === "ONLINE") {
          const paymentConfirmation = await processPayFastPayment();
          if (!paymentConfirmation.success) {
            showToast("Payment failed. Please try again.");
            return;
          }
        }

        const result = await saveOrderToDb(orderData);
        if (result.success) {
          if (savedChecked) {
            await saveAddressToDb(addressData);
          }
          initCheckout();
          showToast("Order placed successfully!", "success");
          sessionStorage.setItem("orderId", result.order._id);
          window.location.href = `./order-place.html`;
        }
      } catch (error) {
        showToast("Failed to place the order.");
        console.error(error);
      } finally {
        hideSpinner();
      }
    });
});
