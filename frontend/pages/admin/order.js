import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  checkUserAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  formatPrice,
  showSpinner,
  hideSpinner,
  showConfirm,
  updatePagination,
  getPageFromURL,
  updatePageInURL,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();
  const currentPage = getPageFromURL() || 1;
  const orderTableBody = document.querySelector("#orderTableBody");
  const orderSearchInput = document.getElementById("orderSearchInput");

  // Fetch and display orders
  async function fetchOrders(page = currentPage, limit = 3) {
    try {
      showSpinner();

      const searchQuery = orderSearchInput.value.trim();
      const queryParams = new URLSearchParams({
        search: searchQuery,
        page,
        limit,
      });

      const response = await fetch(
        `${ENDPOINTS.GET_ALL_ORDER}?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Authorization: token,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        if (result.orders.length === 0) {
          document.querySelector("tbody").innerHTML = `
          <tr class="align-middle">
            <td class="text-center" colspan="7">No order found</td>
          </tr>`;
        } else {
          orderTableBody.innerHTML = result.orders
            .map((order) => {
              // Calculate total quantity of items in the order
              const totalItems = order.orderItems.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return `
              <tr class="text-center align-middle">
                <td>${order.code}</td>
                <td>${order.shippingInfo.firstName} ${
                order.shippingInfo.lastName
              }</td>
                <td>${totalItems}</td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td>
                  <select
                    class="form-select"
                    aria-label="Order Status"
                    onchange="updateOrderStatus('${order._id}', this.value)"
                  >
                    <option value="Pending" ${
                      order.orderStatus === "Pending" ? "selected" : ""
                    }>Pending</option>
                    <option value="Processing" ${
                      order.orderStatus === "Processing" ? "selected" : ""
                    }>Processing</option>
                    <option value="Shipped" ${
                      order.orderStatus === "Shipped" ? "selected" : ""
                    }>Shipped</option>
                    <option value="Delivered" ${
                      order.orderStatus === "Delivered" ? "selected" : ""
                    }>Delivered</option>
                    <option value="Cancelled" ${
                      order.orderStatus === "Cancelled" ? "selected" : ""
                    }>Cancelled</option>
                  </select>
                </td>
                <td>${
                  new Date(order.createdAt).toISOString().split("T")[0]
                }</td>
                <td>
                  <button
                    class="btn btn-sm btn-info"
                    data-bs-toggle="modal"
                    data-bs-target="#viewOrderModal"
                    onclick="viewOrder('${order._id}')"
                  >
                    <i class="fas fa-eye"></i>
                  </button>      
                </td>
              </tr>
            `;
            })
            .join("");

          // Redirect to the last page if current page exceeds total pages
          if (page > result.totalPages && result.totalPages > 0) {
            window.location.href = `${window.location.pathname}?page=${result.totalPages}`;
            return;
          }
        }
        updatePagination(
          result.totalOrders,
          result.currentPage,
          limit,
          (newPage) => {
            fetchOrders(newPage, limit);
            updatePageInURL(newPage);
          }
        );
      } else {
        showToast("Failed to fetch orders: " + result.message, "danger");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("An error occurred while fetching orders", "danger");
    } finally {
      hideSpinner();
    }
  }

  window.viewOrder = async function (orderId) {
    try {
      const response = await fetch(`${ENDPOINTS.GET_ORDER}/${orderId}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: token,
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log(data);
      if (data.success) {
        const order = data.order;

        // Populate modal fields
        document.getElementById(
          "viewCustomerName"
        ).textContent = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;
        document.getElementById("viewOrderCode").textContent = order.code;
        document.getElementById("viewDatePurchase").textContent = new Date(
          order.createdAt
        ).toLocaleDateString();
        document.getElementById("viewOrderStatus").textContent =
          order.orderStatus;
        document.getElementById("viewOrderTotal").textContent = `${formatPrice(
          order.totalAmount
        )}`;
        document.getElementById("viewSubTotal").textContent = `${formatPrice(
          order.subTotal
        )}`;
        document.getElementById(
          "viewShippingCost"
        ).textContent = `${formatPrice(order.shippingCost)}`;
        document.getElementById("viewTax").textContent = `${formatPrice(
          order.tax
        )}`;

        // Payment Info
        document.getElementById("paymentMethod").textContent =
          order.paymentMethod || "N/A";
        document.getElementById("transactionId").textContent =
          order.paymentInfo?.id || "N/A";
        document.getElementById("paymentStatus").textContent =
          order.paymentInfo?.status || "N/A";

        // Shipping Info
        document.getElementById("shippingFirstName").textContent =
          order.shippingInfo.firstName;
        document.getElementById("shippingLastName").textContent =
          order.shippingInfo.lastName;
        document.getElementById("shippingAddress").textContent = `${
          order.shippingInfo.addressLine1
        } ${order.shippingInfo.addressLine2 || ""}`;
        document.getElementById("shippingPostalCode").textContent =
          order.shippingInfo.postalCode;
        document.getElementById("shippingCity").textContent =
          order.shippingInfo.city;
        document.getElementById("shippingCountry").textContent =
          order.shippingInfo.country;

        // Contact Info
        document.getElementById("viewMobileNumber").textContent =
          order.mobileNumber || "N/A";
        document.getElementById("viewEmail").textContent =
          order.user.email || "N/A";

        // Order Items
        const itemsList = document.getElementById("viewOrderItemsList");
        itemsList.innerHTML = "";
        order.orderItems.forEach((item) => {
          const listItem = document.createElement("li");
          listItem.classList.add("d-flex", "align-items-center", "mb-3");

          listItem.innerHTML = `
            <div class="me-3">
              <img
                src="${item.product.images[0]?.url || "placeholder.jpg"}"
                alt="${item.name}"
                class="img-thumbnail"
                style="width: 90px; height: 90px; object-fit: cover;"
              />
            </div>
           <div>
              <p class="mb-0"><strong>${item.name}</strong></p>
              <p class="mb-0 text-muted">
                Quantity: ${item.quantity} | Size: ${item.size.label || "N/A"} 
              </p>
               ${
                 item.size.label === "CUSTOM"
                   ? `
                  <small class="mb-0 text-muted">Measurements: ${Object.entries(
                    item.size.customSize
                  )
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}</small>
                `
                   : ""
               }
              <p class="mb-0"><strong>Price:</strong> ${formatPrice(
                item.price
              )}</p>
            </div>
          `;
          itemsList.appendChild(listItem);
        });
      } else {
        showToast(data.message || "Unable to fetch order details.");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      showToast("Unable to load order details. Please try again later.");
    }
  };

  window.updateOrderStatus = async function (orderId, status) {
    try {
      const response = await fetch(`${ENDPOINTS.UPDATE_ORDER}/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({ orderStatus: status }),
      });

      const result = await response.json();
      if (result.success) {
        showToast("Order status updated successfully", "success");
        fetchOrders(currentPage);
      } else {
        showToast("Failed to update order status: " + result.message, "danger");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("An error occurred while updating order status", "danger");
    }
  };

  // Load orders on page load
  fetchOrders(currentPage);

  let searchTimeout;
  orderSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchOrders(1);
      updatePageInURL(1);
    }, 500);
  });
});
