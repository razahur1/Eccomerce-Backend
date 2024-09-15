import {
  showError,
  clearErrors,
  clearInputs,
  startResendTimer,
  showToast,
  showSpinner,
  hideSpinner,
} from "../../assets/js/utils.js";
import ENDPOINTS from "../../assets/js/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  const otpModal = document.getElementById("otp-modal");
  const closeModal = document.getElementById("close-modal");
  const verifyOtpButton = document.getElementById("verify-otp");
  const resendOtpButton = document.getElementById("resend-otp");
  const newPasswordInput = document.getElementById("new-password");

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

  // Handle forgot password form submission
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email_1").value.trim();

    // Clear previous errors
    clearErrors();

    if (!email) {
      showError("email-error", "Email is required");
      return;
    }

    // Show the spinner before making the request
    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      showToast("An error occurred during forgot password", "danger");
    } finally {
      // Hide the spinner after the request completes
      hideSpinner();
    }
  });

  // Handle OTP verification
  verifyOtpButton.addEventListener("click", async () => {
    const otp = document.getElementById("otp").value.trim();
    const email = document.getElementById("email_1").value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (!otp) {
      showError("otp-error", "OTP is required");
      return;
    }

    if (!newPassword || !passwordRegex.test(newPassword)) {
      showError(
        "new-password-error",
        "Password must be at least 6 characters long and include at least one number, one lowercase letter, and one uppercase letter"
      );
      return;
    }

    // Show the spinner before making the request
    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const result = await response.json();

      if (result.success) {
        otpModal.style.display = "none";
        forgotPasswordForm.reset();
        showToast("Password reset successfully", "success");
        window.location.href = "../login/login.html";
      } else {
        showError("otp-error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during forgot password", "danger");
    } finally {
      // Hide the spinner after the request completes
      hideSpinner();
    }
  });

  // Handle resend OTP
  resendOtpButton.addEventListener("click", async () => {
    const email = document.getElementById("email_1").value.trim();

    // Show the spinner before making the request
    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      showToast("An error occurred during forgot password", "danger");
    } finally {
      // Hide the spinner after the request completes
      hideSpinner();
    }
  });

  // Close OTP modal
  closeModal.addEventListener("click", () => {
    otpModal.style.display = "none";
  });
});
