import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import { showToast, showSpinner, hideSpinner } from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");

  // Variables to track the current page and total pages
  let currentPage = 1;
  let totalPages = 1;
  let limit = 10; // Default limit for pagination

  window.fetchCustomers = async function (page = 1, limit = 3) {
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
        totalPages = result.totalPages;
        updatePaginationControls(result.totalUsers);
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

  function updatePaginationControls(totalUsers) {
    const paginationControls = document.getElementById("pagination-controls");
    const paginationInfo = document.getElementById("pagination-info");
    paginationControls.innerHTML = "";

    // Update pagination info
    paginationInfo.innerHTML = `Showing ${
      (currentPage - 1) * limit + 1
    } to ${Math.min(
      currentPage * limit,
      totalUsers
    )} of ${totalUsers} customers`;

    // Previous button
    if (currentPage > 1) {
      const prevLi = document.createElement("li");
      prevLi.className = "page-item";
      prevLi.innerHTML = `<a class="page-link" href="javascript:void(0);" onclick="fetchCustomers(${
        currentPage - 1
      }); return false;">Previous</a>`;
      paginationControls.appendChild(prevLi);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === currentPage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="javascript:void(0);" onclick="fetchCustomers(${i}); return false;">${i}</a>`;
      paginationControls.appendChild(li);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextLi = document.createElement("li");
      nextLi.className = "page-item";
      nextLi.innerHTML = `<a class="page-link" href="javascript:void(0);" onclick="fetchCustomers(${
        currentPage + 1
      }); return false;">Next</a>`;
      paginationControls.appendChild(nextLi);
    }
  }

  // Initial fetch of customers
  fetchCustomers();

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
      }, 500);
    });
});
