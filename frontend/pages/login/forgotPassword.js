import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  showSpinner,
  hideSpinner,
} from "../../assets/js/utils.js";
import ENDPOINTS from "../../assets/js/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordForm = document.getElementById("forgot-password-form");

  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email_2").value.trim();

    clearErrors();

    if (!email) {
      showError("email-error", "Email is required");
      return;
    }

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        clearInputs();
        showToast("Reset Password Link is sent to you email", "success");
      } else {
        clearInputs();
        showToast(result.message, "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during forgot password", "danger");
    } finally {
      hideSpinner();
    }
  });
});
