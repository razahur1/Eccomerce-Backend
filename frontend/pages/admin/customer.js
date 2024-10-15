import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  updatePagination,
  getPageFromURL,
  updatePageInURL,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Check admin authentication
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
    return;
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();
  const currentPage = getPageFromURL() || 1; 

  // Function to fetch customers
  window.fetchCustomers = async function (page = currentPage, limit = 3) {
    try {
      showSpinner();
      const searchQuery = document.getElementById("CustomersearchInput").value;

      const queryParams = new URLSearchParams({
        search: searchQuery,
        page: page,
        limit: limit,
      });

      const response = await fetch(
        `${ENDPOINTS.GET_USERS}?${queryParams.toString()}`,
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

        // Update pagination info using the totalPages from API response
        updatePagination(
          result.totalUsers,
          result.currentPage,
          limit,
          (newPage) => {
            fetchCustomers(newPage, limit);
            updatePageInURL(newPage);
          }
        );

        // Redirect to the last page if current page exceeds total pages
        if (page > result.totalPages) {
          window.location.href = `${window.location.pathname}?page=${result.totalPages}`;
          return;
        }
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

  // Function to view customer details
  window.viewCustomer = function (userData) {
    const user = JSON.parse(userData);
    const fullName = `${user.firstName || "N/A"} ${user.lastName || ""}`.trim();
    const address = user.defaultAddress
      ? `${user.defaultAddress.addressLine1}${
          user.defaultAddress.addressLine2
            ? ", " + user.defaultAddress.addressLine2
            : ""
        }, ${user.defaultAddress.city}, ${user.defaultAddress.postalCode}, ${
          user.defaultAddress.country
        }`
      : "N/A";

    // Populate modal fields
    document.getElementById("viewCustomerName").textContent = fullName;
    document.getElementById("viewCustomerEmail").textContent =
      user.email || "N/A";
    document.getElementById("viewCustomerPhone").textContent =
      user.mobileNumber || "N/A";
    document.getElementById("viewTotalOrders").textContent =
      user.totalOrders || 0;
    document.getElementById("viewCustomerAddress").textContent = address;
    document.getElementById("viewCustomerRegisteredOn").textContent =
      new Date(user.createdAt).toLocaleDateString() || "N/A";
    document.getElementById("viewCustomerUpdatedOn").textContent =
      new Date(user.updatedAt).toLocaleDateString() || "N/A";
    document.getElementById("viewCustomerPhoto").src =
      user.profilePhoto?.url || "../../assets/img/avatar.png";
  };

  // Search functionality
  let searchTimeout;
  document
    .getElementById("CustomersearchInput")
    .addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchCustomers(1);
        updatePageInURL(1); // Set the page to 1 in the URL
      }, 500);
    });
});
