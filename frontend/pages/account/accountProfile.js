import ENDPOINTS from "../../assets/js/config.js";
import { showError, clearErrors } from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const changePasswordForm = document.getElementById("changePasswordForm");

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById("password_old").value.trim();
    const newPassword = document.getElementById("password_1").value.trim();
    const confirmNewPassword = document
      .getElementById("password_2")
      .value.trim();

    // Clear previous errors
    clearErrors();

    let valid = true;

    if (!oldPassword) {
      showError("password_old-error", "Old password is required");
      valid = false;
    }
    if (!newPassword) {
      showError("password_1-error", "New password is required");
      valid = false;
    }
    if (newPassword !== confirmNewPassword) {
      showError("password_2-error", "Passwords do not match");
      valid = false;
    }

    if (valid) {
      try {
        const response = await fetch(ENDPOINTS.CHANGE_PASSWORD, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Password changed successfully");
          changePasswordForm.reset();
        } else {
          showError("form-error", result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        showError(
          "form-error",
          "An error occurred while changing the password"
        );
      }
    }
  });
});
