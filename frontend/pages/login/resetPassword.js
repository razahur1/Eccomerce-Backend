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
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");
  const token = urlParams.get("token");

  if (!userId && !token) {
    window.location.href = "../login/login.html";
  }

  const resetPasswordForm = document.getElementById("reset-password-form");

  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword_1").value;

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    clearErrors();

    if (!newPassword || !passwordRegex.test(newPassword)) {
      showError(
        "password-error",
        "Password must be at least 6 characters long and include at least one number, one lowercase letter, and one uppercase letter"
      );
      return;
    }

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          token,
          newPassword,
        }),
      });
      const result = await response.json();

      if (result.success) {
        clearInputs();
        showToast("Password reset successfully.", "success");
        window.location.href = "./login.html";
      } else {
        clearInputs();
        showToast(result.message, "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      clearInputs();
      showToast("An error occurred during reset password", "danger");
    } finally {
      hideSpinner();
    }
  });
});
