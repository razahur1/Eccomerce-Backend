import ENDPOINTS from "./config.js";
import { showToast, showSpinner, hideSpinner } from "./utils.js";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

export const checkUserAuth = () => {
  let token = localStorage.getItem("token") || getCookie("token");
  if (!token) {
    return false;
  }
  return true;
};

export const checkAdminAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return false;
  }

  return true;
};

export const protectedLinks = () => {
  document.querySelectorAll(".protected-route").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!checkUserAuth()) {
        event.preventDefault();
        showToast("You are'nt Logged in. Please Login!", "danger", true);
        //window.location.href = "../login/login.html";
      }
    });
  });
};

export const protectAdminRoute = () => {
  if (!checkAdminAuth()) {
    document.body.innerHTML = `
      <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div class="container text-center">
          <div class="row">
            <div class="col-md-6 offset-md-3">
              <div class="card shadow-lg p-4">
                <div class="card-body">
                  <div class="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-lock-fill text-danger" viewBox="0 0 16 16">
                      <path d="M8 1a4 4 0 0 0-4 4v3H2.5A1.5 1.5 0 0 0 1 9.5v5A1.5 1.5 0 0 0 2.5 16h11A1.5 1.5 0 0 0 15 14.5v-5A1.5 1.5 0 0 0 13.5 8H12V5a4 4 0 0 0-4-4zm0 8V5a3 3 0 0 1 6 0v3H8zm-1 3a1 1 0 0 1-2 0h4a1 1 0 0 1-2 0z"/>
                    </svg>
                  </div>
                  <h1 class="display-4 text-danger">Access Denied</h1>
                  <p class="lead mb-4">Oops! You are not authorized to access this page.</p>
                  <a href="../../pages/login/login.html" class="btn btn-primary btn-lg">Go to Login</a>
                  <a href="../../pages/home/index.html" class="btn btn-outline-secondary btn-lg ms-2">Back to Homepage</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }
};

export const setUserInfo = (user) => {
  let existingUser = JSON.parse(localStorage.getItem("user")) || {};

  const { firstName, lastName, email, profilePhoto, role } = user;

  existingUser.firstName = firstName || existingUser.firstName;
  existingUser.lastName = lastName || existingUser.lastName;
  existingUser.email = email || existingUser.email;
  existingUser.profilePhoto =
    profilePhoto && profilePhoto.url
      ? profilePhoto.url
      : existingUser.profilePhoto || null;
  if (role) {
    existingUser.role = role || existingUser.role;
  }

  localStorage.setItem("user", JSON.stringify(existingUser));
};

export const loadUserInfo = () => {
  showSpinner();
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("profilePicture").src =
      user.profilePhoto || "../../assets/img/avatar.png";
    document.getElementById("userName").textContent =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User Name";
    document.getElementById("userEmail").innerHTML = `<a href="mailto:${
      user.email || "#"
    }">${user.email || "user@email.com"}</a>`;
  }
  hideSpinner();
};

export const logoutHandler = () => {
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    showSpinner();

    try {
      const response = await fetch(ENDPOINTS.LOGOUT, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        localStorage.clear();
        window.location.href = "../login/login.html";
      } else {
        showToast(`Logout failed: ${result.message}`, "danger");
      }
    } catch (error) {
      showToast("Error during logout", "danger");
    } finally {
      hideSpinner();
    }
  });
};
