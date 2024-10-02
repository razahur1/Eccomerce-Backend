import ENDPOINTS from "../../assets/js/config.js";
import {
  showError,
  clearErrors,
  clearInputs,
  startResendTimer,
  showToast,
  showSpinner,
  hideSpinner,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const otpModal = document.getElementById("otp-modal");
  const closeModal = document.getElementById("close-modal");
  const verifyOtpButton = document.getElementById("verify-otp");
  const resendOtpButton = document.getElementById("resend-otp");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    clearErrors();

    let valid = true;

    if (!name) {
      showError("name-error", "Name is required");
      valid = false;
    }
    if (!email || !emailRegex.test(email)) {
      showError("email-error", "Please enter a valid email address");
      valid = false;
    }
    if (!password || !passwordRegex.test(password)) {
      showError(
        "password-error",
        "Password must be at least 6 characters long and include at least one number, one lowercase letter, and one uppercase letter"
      );
      valid = false;
    }
    if (password !== confirmPassword) {
      showError("confirm-password-error", "Passwords do not match");
      valid = false;
    }
    if (!terms) {
      showError("terms-error", "You must accept the terms");
      valid = false;
    }

    if (valid) {
      showSpinner();

      try {
        const response = await fetch(ENDPOINTS.VERIFY_ACCOUNT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName: name, email, password }),
        });
        const result = await response.json();

        if (result.success) {
          otpModal.style.display = "block";
          startResendTimer("resend-otp", 120); // 2 minutes
        } else {
          showError("email-error", result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        clearInputs();
        showToast("An error occurred during signup", "danger");
      } finally {
        hideSpinner();
      }
    }
  });

  closeModal.addEventListener("click", () => {
    otpModal.style.display = "none";
  });

  verifyOtpButton.addEventListener("click", async () => {
    const otp = document.getElementById("otp").value.trim();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!otp) {
      showError("otp-error", "OTP is required");
      return;
    }

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: name, email, password, otp }),
      });
      const result = await response.json();

      if (result.success) {
        otpModal.style.display = "none";
        signupForm.reset();
        showToast("User registered successfully", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } else {
        showError("otp-error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during signup", "danger");
    } finally {
      hideSpinner();
    }
  });

  resendOtpButton.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.VERIFY_ACCOUNT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();

      if (result.success) {
        showToast(
          "OTP resend to your email. Please verify your account.",
          "success"
        );
        startResendTimer("resend-otp", 120); // 2 minutes
      } else {
        showError("otp-error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during signup", "danger");
    } finally {
      hideSpinner();
    }
  });
});
