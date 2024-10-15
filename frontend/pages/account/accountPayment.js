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
  const paymentForm = document.getElementById("addEditPaymentForm");
  const paymentCardSection = document.getElementById("paymentCardSection");
  const paymentFormHeading = document.getElementById("paymentFormTitle");

  // Fetch and display all cards
  async function fetchCards() {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_PAYMENTS, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: token,
        },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        if (result.payments.length > 0) {
          paymentCardSection.innerHTML = result.payments
            .map(
              (pay) => `
              <div class="col-md-6">
                <div class="card mb-5" id="card${pay._id}">
                  <div class="card-header py-3 d-flex align-items-center">
                    <h6 class="m-0">${pay.cardDetails.cardType}</h6> 
                    <span class="ms-auto">
                      <img width="40" src="../../assets/img/flags/${
                        pay.cardDetails.cardType
                      }.png" title="" alt=""/>
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-12">
                        <span class="small letter-spacing-2">CARD NUMBER</span>
                       <h6 class="m-0 mt-1">xxxx xxxx xxxx ${pay.cardDetails.cardNumber.slice(
                         -4
                       )}</h6>
                      </div>
                      <div class="col-8">
                        <span class="small letter-spacing-2">NAME OF CARD</span>
                        <h6 class="m-0 mt-1">${
                          pay.cardDetails.cardHolderName
                        }</h6>
                      </div>
                      <div class="col-4">
                        <span class="small letter-spacing-2">VALIDITY</span>
                        <h6 class="m-0 mt-1">${pay.cardDetails.expiryDate}</h6>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer d-flex p-3">
                    <a class="link-mode text-uppercase fw-500" href="#" onclick="editCard('${
                      pay._id
                    }')">Edit</a>
                    <a class="link-danger text-uppercase fw-500 ms-auto" href="#" onclick="removeCard('${
                      pay._id
                    }')">Remove</a>
                  </div>
                </div>
              </div>
            `
            )
            .join("");
        } else {
          paymentCardSection.innerHTML = `
            <div class="text-center my-5">
              <div class="mb-3">
                <i class="fas fa-credit-card fa-3x text-muted"></i>
              </div>
              <hr>
              <h5 class="text-muted">No Payment Cards Found</h5>
              <p class="text-secondary">It looks like you haven't added any payment cards yet. Add a new card to get started!</p>
            </div>
          `;
        }
      } else {
        showToast("Failed to fetch cards", "danger");
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      showToast("An error occurred while fetching cards", "danger");
    } finally {
      hideSpinner();
    }
  }

  // Call the function to load addresses on page load
  fetchCards();

  // Add or update address logic
  paymentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cardNumber = document.getElementById("cc-number").value.trim();
    const cardHolderName = document.getElementById("cc-name").value.trim();
    const expiryDate = document.getElementById("cc-expiry").value.trim();
    const cvv = document.getElementById("cc-cvc").value.trim();

    clearErrors();

    if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
      showToast("All fields are required.", "warning");
      return;
    }

    showSpinner();

    const payload = {
      cardDetails: {
        cardNumber,
        cardHolderName,
        expiryDate,
        cvv,
      },
    };

    console.log("Payload to be sent:", JSON.stringify(payload)); // Log the payload

    try {
      const response = await fetch(ENDPOINTS.ADD_PAYMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        showToast("Card Details added Successfully", "success");
        fetchCards();
        clearInputs();
        hidePaymentForm();
      } else {
        showToast(
          `Failed to save card: ${result.message || "Unknown error"}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error saving card:", error);
      showToast("An error occurred while saving card", "danger");
    } finally {
      hideSpinner();
    }
  });

  window.removeCard = async function (id) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this card?"
    );
    if (confirmed) {
      showSpinner();
      try {
        const response = await fetch(`${ENDPOINTS.DELETE_PAYMENT}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) {
          showToast("Card deleted successfully", "success");
          fetchCards();
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        console.error("Error deleting card:", error);
        showToast("An error occurred while deleting card", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  // Show and hide form functions
  window.showPaymentForm = function () {
    document.getElementById("paymentForm").classList.remove("collapse");
    document.getElementById("paymentTable").classList.add("collapse");
  };

  window.hidePaymentForm = function () {
    document.getElementById("paymentTable").classList.remove("collapse");
    document.getElementById("paymentForm").classList.add("collapse");
  };

  // Reset form for adding a new address
  window.addPayment = function () {
    paymentForm.reset();
    paymentFormHeading.innerText = "Add New Card"; // Update title for adding new address
    showPaymentForm();
  };
});
