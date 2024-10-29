import ENDPOINTS from "../../assets/js/config.js";
import {
  checkUserAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  showSpinner,
  hideSpinner,
  showConfirm,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
    return;
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();

  // Fetch HTML elements
  const addressForm = document.getElementById("addEditAddressForm");
  const addressCardSection = document.getElementById("addressCardSection");
  const addressFormHeading = document.getElementById("addressFormTitle");

  // Fetch and display all addresses
  async function fetchAddresses() {
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

      const result = await response.json();
      console.log(result);

      if (result.success) {
        if (result.addresses.length > 0) {
          addressCardSection.innerHTML = result.addresses
            .map(
              (address) => `
              <div class="col-lg-6">
                <div class="card mb-5" id="addressCard${address._id}">
                  <div class="card-header position-relative py-3 d-flex justify-content-between align-items-center">
                    <h5 class="m-0">Billing Address</h5>
                    ${
                      address.isDefault
                        ? '<span class="badge bg-info">Primary</span>'
                        : ""
                    }
                    <div>
                      <button
                        class="btn btn-sm btn-warning"
                        onclick="editAddress('${address._id}', '${
                address.addressLine1
              }', '${address.addressLine2 || ""}', '${address.postalCode}', '${
                address.city
              }', '${address.country}', ${address.isDefault})"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <a
                        class="btn btn-sm btn-danger"
                        href="#"
                        role="button"
                        onclick="deleteAddress('${address._id}')"
                      >
                        <i class="bi bi-trash"></i>
                      </a>
                    </div>
                  </div>
                  <div class="card-body">
                    <table class="table">
                      <tbody>
                        <tr>
                          <td>
                            <p class="m-0">
                              ${address.addressLine1}, <br/> 
                              ${
                                address.addressLine2
                                  ? `${address.addressLine2},`
                                  : ""
                              }
                              ${address.postalCode} <br />
                              ${address.city}<br />
                              ${address.country}<br />
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            `
            )
            .join("");
        } else {
          addressCardSection.innerHTML = `
          <div class="text-center my-5">
            <div class="mb-3">
              <i class="fas fa-credit-card fa-3x text-muted"></i>
            </div>
            <hr>
            <h5 class="text-muted">No Shipping Address Found</h5>
            <p class="text-secondary">It looks like you haven't added any shipping address yet. Add a new address to get started!</p>
          </div>
        `;
        }
      } else {
        showToast("Failed to fetch addresses", "danger");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("An error occurred while fetching addresses", "danger");
    } finally {
      hideSpinner();
    }
  }

  // Call the function to load addresses on page load
  fetchAddresses();

  // Add or update address logic
  addressForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const addressId = document.getElementById("addressId")?.value;
    const line1 = document.getElementById("address-line1").value.trim();
    const line2 = document.getElementById("address-line2").value.trim();
    const zip = document.getElementById("address-zip").value.trim();
    const city = document.getElementById("address-city").value.trim();
    const country = document.getElementById("address-country").value.trim();
    const primary = document.getElementById("address-primary").checked;

    clearErrors();

    if (!line1 || !city || !zip || !country) {
      showError("address-error", "All fields are required.");
      return;
    }

    showSpinner();

    try {
      const url = addressId
        ? `${ENDPOINTS.UPDATE_ADDRESS}/${addressId}`
        : ENDPOINTS.ADD_ADDRESS;
      const method = addressId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({
          addressLine1: line1,
          addressLine2: line2,
          postalCode: zip,
          city: city,
          country: country,
          isDefault: primary,
        }),
      });
      const result = await response.json();

      if (result.success) {
        showToast(addressId ? "Address updated" : "Address added", "success");
        fetchAddresses();
        clearInputs();
        hideAddressForm();
      } else {
        showToast(
          `Failed to save address: ${result.message || "Unknown error"}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("An error occurred while saving address", "danger");
    } finally {
      hideSpinner();
    }
  });

  // Edit address
  window.editAddress = function (
    id,
    line1,
    line2,
    zip,
    city,
    country,
    primary
  ) {
    document.getElementById("addressId").value = id;
    document.getElementById("address-line1").value = line1;
    document.getElementById("address-line2").value = line2;
    document.getElementById("address-zip").value = zip;
    document.getElementById("address-city").value = city;
    document.getElementById("address-country").value = country;
    document.getElementById("address-primary").checked = primary;
    addressFormHeading.innerText = "Edit Address";
    showAddressForm();
  };

  // Delete address
  window.deleteAddress = async function (id) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this address?"
    );
    if (confirmed) {
      showSpinner();
      try {
        const response = await fetch(`${ENDPOINTS.DELETE_ADDRESS}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) {
          showToast("Address deleted successfully", "success");
          fetchAddresses();
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        console.error("Error deleting address:", error);
        showToast("An error occurred while deleting address", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  // Show and hide form functions
  window.showAddressForm = function () {
    document.getElementById("addressForm").classList.remove("collapse");
    document.getElementById("addressTable").classList.add("collapse");
  };

  window.hideAddressForm = function () {
    document.getElementById("addressTable").classList.remove("collapse");
    document.getElementById("addressForm").classList.add("collapse");
  };

  // Reset form for adding a new address
  window.addAddress = function () {
    addressForm.reset();
    addressFormHeading.innerText = "Add New Address"; // Update title for adding new address
    showAddressForm();
  };
});
