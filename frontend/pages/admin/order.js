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
  checkAdminAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
  setUserInfo,
} from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/login.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();
});
