import ENDPOINTS from "../../assets/js/config.js";
import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  showSpinner,
  hideSpinner,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email_1").value.trim();
    const password = document.getElementById("password_1").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Clear previous errors
    clearErrors();

    if (!email || !emailRegex.test(email)) {
      showError("email-error", "Please enter a valid email address");
      return;
    }

    if (!password) {
      showError("password-error", "Password is required");
      return;
    }

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        //window.location.href = "../home/index.html";
        window.location.href = "../account/account-profile.html";
        showToast("User logged in successfully", "success");
      } else {
        showError("password-error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during login", "danger");
    } finally {
      hideSpinner();
    }
  });
});
