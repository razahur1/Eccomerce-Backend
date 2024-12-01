import ENDPOINTS from "../../assets/js/config.js";
import {
  showSpinner,
  hideSpinner,
  showToast,
  formatPrice,
} from "../../assets/js/utils.js";
import {
  checkAdminAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/login.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();

  async function fetchOverview() {
    try {
      showSpinner();

      const response = await fetch(ENDPOINTS.GET_OVERVIEW, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        document.getElementById("totalProducts").textContent =
          result.totalProducts;
        document.getElementById("totalOrders").textContent = result.totalOrders;
        document.getElementById("totalCustomers").textContent =
          result.totalCustomers;
        document.getElementById("totalRevenue").textContent = formatPrice(
          result.totalRevenue
        );
      } else {
        showToast("Failed to fetch overview", "danger");
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
      showToast("An error occurred while fetching overview", "danger");
    } finally {
      hideSpinner();
    }
  }

  async function fetchPendingOrders() {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_PENDING_ORDER, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        const pendingOrdersContainer = document.getElementById(
          "pending-orders-container"
        );

        // Clear existing orders
        pendingOrdersContainer.innerHTML = "";

        // Add pending orders to the list
        result.pendingOrders.forEach((order) => {
          const listItem = document.createElement("li");
          listItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );
          const orderText = document.createTextNode(`Order #${order.code}`);
          const badge = document.createElement("span");
          badge.classList.add("badge", "bg-warning");
          badge.textContent = "Pending";
          listItem.appendChild(orderText);
          listItem.appendChild(badge);
          pendingOrdersContainer.appendChild(listItem);
        });
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    } finally {
      hideSpinner();
    }
  }

  async function fetchOutOfStockProducts() {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_OUT_OF_STOCK, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        const outOfStockContainer = document.getElementById(
          "out-of-stock-container"
        );

        // Clear existing orders
        outOfStockContainer.innerHTML = "";

        // Add pending orders to the list
        result.products.forEach((product) => {
          const listItem = document.createElement("li");
          listItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );

          const productCode = document.createTextNode(
            `Product #${product.code}`
          );
          const productText = document.createTextNode(product.name);
          const badge = document.createElement("span");
          badge.classList.add("badge", "bg-danger");
          badge.textContent = "Out of Stock";

          listItem.appendChild(productCode);
          //listItem.appendChild(productText);
          listItem.appendChild(badge);

          outOfStockContainer.appendChild(listItem);
        });
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    } finally {
      hideSpinner();
    }
  }

  fetchOverview();
  fetchPendingOrders();
  fetchOutOfStockProducts();
});
