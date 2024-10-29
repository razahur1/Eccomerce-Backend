import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  showSpinner,
  hideSpinner,
  generateStrongPassword,
  updatePasswordStrength,
} from "../../assets/js/utils.js";
import ENDPOINTS from "../../assets/js/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");
  const token = urlParams.get("token");

  if (!userId && !token) {
    window.location.href = "../login/login.html";
  }

  const passwordInput = document.getElementById("newPassword_1");
  const passwordSuggestion = document.getElementById("password-suggestion");

  const suggestedPassword = generateStrongPassword();

  passwordSuggestion.addEventListener("click", () => {
    passwordInput.value = suggestedPassword;

    const originalType = passwordInput.type;
    passwordInput.type = "text";

    passwordInput.style.display = "block";

    updatePasswordStrength(suggestedPassword);

    navigator.clipboard.writeText(suggestedPassword).then(() => {
      showToast("Suggested password copied to clipboard", "success");
    });

    setTimeout(() => {
      passwordInput.type = originalType;
    }, 3000);
  });

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    updatePasswordStrength(password);
  });

  const resetPasswordForm = document.getElementById("reset-password-form");

  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword_1").value;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{12,}$/;

    clearErrors();

    if (!newPassword || !passwordRegex.test(newPassword)) {
      showError(
        "password-error",
        "Password must be at least 8 characters, including letters and numbers"
      );
      setTimeout(() => clearErrors(), 3000);
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
