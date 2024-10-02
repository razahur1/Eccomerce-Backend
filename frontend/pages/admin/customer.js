import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  updatePagination,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");

  // Retrieve page from URL or set to 1
  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get("page")) || 1;

  window.fetchCustomers = async function (page = currentPage, limit = 3) {
    currentPage = page;
    try {
      showSpinner();

      const searchQuery = document.getElementById("CustomersearchInput").value;

      const queryParams = new URLSearchParams({
        search: searchQuery,
        page: page,
        limit: limit,
      });

      const response = await fetch(
        `${ENDPOINTS.GET_USERS}?${queryParams.toString()}`, // Adjust this endpoint as needed
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
            "Cache-Control": "no-cache",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update customer table body
        document.querySelector("tbody").innerHTML = result.users
          .map((user) => {
            const fullName =
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || "N/A";

            return `
          <tr class="align-middle">
            <td>${fullName}</td>
            <td>${user.email}</td>
            <td>${user.mobileNumber || "N/A"}</td>
            <td>${user.totalOrders}</td>
            <td>
              <button
                class="btn btn-sm btn-info"
                data-bs-toggle="modal"
                data-bs-target="#viewCustomerModal"
                data-user='${JSON.stringify(user)
                  .replace(/'/g, "&quot;")
                  .replace(/"/g, "&quot;")}'
                onclick="viewCustomer(this.dataset.user);">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `;
          })
          .join("");

        currentPage = result.currentPage;
        updatePagination(result.totalUsers, currentPage, limit, (newPage) => {
          fetchCustomers(newPage, limit);
          // Update the URL with the new page number
          urlParams.set("page", newPage);
          window.history.pushState(
            {},
            "",
            `${window.location.pathname}?${urlParams}`
          );
        });
      } else {
        showToast("Failed to fetch customers", "danger");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showToast("An error occurred while fetching customers", "danger");
    } finally {
      hideSpinner();
    }
  };

  // Initial fetch of customers
  fetchCustomers(currentPage);

  window.viewCustomer = function (userData) {
    const user = JSON.parse(userData);

    const fullName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || "N/A";
    const email = user.email || "N/A";
    const phone = user.mobileNumber || "N/A";
    const totalOrders = user.totalOrders || 0;

    const address = user.defaultAddress
      ? `${user.defaultAddress.addressLine1}${
          user.defaultAddress.addressLine2
            ? ", " + user.defaultAddress.addressLine2
            : ""
        }, ${user.defaultAddress.city}, ${user.defaultAddress.postalCode}, ${
          user.defaultAddress.country
        }`
      : "N/A";
    const registrationDate =
      new Date(user.createdAt).toLocaleDateString() || "N/A";
    const updatedDate = new Date(user.updatedAt).toLocaleDateString() || "N/A";
    const profilePhoto =
      user.profilePhoto?.url || "../../assets/img/avatar.png";

    // Populate modal fields
    document.getElementById("viewCustomerName").textContent = fullName;
    document.getElementById("viewCustomerEmail").textContent = email;
    document.getElementById("viewCustomerPhone").textContent = phone;
    document.getElementById("viewTotalOrders").textContent = totalOrders;
    document.getElementById("viewCustomerAddress").textContent = address;
    document.getElementById("viewCustomerRegisteredOn").textContent =
      registrationDate;
    document.getElementById("viewCustomerUpdatedOn").textContent = updatedDate;
    document.getElementById("viewCustomerPhoto").src = profilePhoto;
  };

  // Search functionality
  let searchTimeout;
  document
    .getElementById("CustomersearchInput")
    .addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchCustomers(1);
        // Update the URL to page=1 when a search is performed
        urlParams.set("page", 1);
        window.history.pushState(
          {},
          "",
          `${window.location.pathname}?${urlParams}`
        );
      }, 500);
    });
});
