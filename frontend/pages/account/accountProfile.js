import ENDPOINTS from "../../assets/js/config.js";
import {
  showError,
  clearErrors,
  clearInputs,
  showSpinner,
  hideSpinner,
  showToast,
} from "../../assets/js/utils.js";
import {
  checkUserAuth,
  loadUserInfo,
  logoutHandler,
  setUserInfo,
} from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const updateProfileForm = document.getElementById("updateProfileForm");

  const loadProfileData = async () => {
    showSpinner();
    try {
      const response = await fetch(ENDPOINTS.GET_PROFILE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        document.getElementById("firstName").value = result.user.firstName;
        document.getElementById("lastName").value = result.user.lastName || " ";
        document.getElementById("email").value = result.user.email;
        document.getElementById("mobile").value =
          result.user.mobileNumber || " ";
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      hideSpinner();
    }
  };

  loadProfileData();

  updateProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const profilePhoto = document.getElementById("formFile").files[0];

    clearErrors();

    let valid = true;

    if (!firstName) {
      showError("firstName-error", "First name is required");
      valid = false;
    }
    if (!lastName) {
      showError("lastName-error", "Last name is required");
      valid = false;
    }
    if (!mobile) {
      showError("mobile-error", "Mobile number is required");
      valid = false;
    }

    if (valid) {
      try {
        // Show spinner
        showSpinner();

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("mobileNumber", mobile);
        if (profilePhoto) {
          formData.append("file", profilePhoto);
        }

        const response = await fetch(ENDPOINTS.UPDATE_PROFILE, {
          method: "PUT",
          headers: {
            Authorization: token,
          },
          credentials: "include",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const updatedUser = result.user;
          clearInputs(updateProfileForm);
          setUserInfo(updatedUser);
          loadUserInfo();
          await loadProfileData();

          showToast("Profile updated successfully", "success");
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        showToast("An error occurred while updating the profile", "danger");
      } finally {
        hideSpinner();
      }
    }
  });

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById("password_old").value.trim();
    const newPassword = document.getElementById("password_1").value.trim();
    const confirmNewPassword = document
      .getElementById("password_2")
      .value.trim();

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    // Clear previous errors
    clearErrors();

    let valid = true;

    if (!oldPassword) {
      showError("password_old-error", "Current password is required");
      valid = false;
    }
    if (!newPassword || !passwordRegex.test(newPassword)) {
      showError(
        "password_1-error",
        "Password must be at least 6 characters long and include at least one number, one lowercase letter, and one uppercase letter"
      );
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
            Authorization: token,
          },
          credentials: "include",
          body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
        });

        const result = await response.json();

        if (result.success) {
          showToast("Password changed successfully", "success");
          clearInputs(changePasswordForm);
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        showToast("An error occurred while changing the password", "danger");
      }
    }
  });
});
