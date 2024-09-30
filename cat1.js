import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";
import {
  showError,
  clearErrors,
  clearInputs,
  showToast,
  showSpinner,
  hideSpinner,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");
  const productForm = document.getElementById("addEditProductForm");
  const productTableBody = document.querySelector("#productTableBody");
  const formHeading = document.getElementById("formTitle");

  // Fetch and display categories
  async function fetchCategories() {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_CATEGORIES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const result = await response.json();

      if (result.success) {
        const categoryWrapper = document.getElementById("categories-wrapper");
        categoryWrapper.innerHTML = result.categories
          .map(
            (category) =>
              `<option value="${category.id}">${category.name}</option>`
          )
          .join("");
      } else {
        showToast("Failed to fetch categories", "danger");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("An error occurred while fetching categories", "danger");
    } finally {
      hideSpinner();
    }
  }

  // Function to dynamically add a category select element
  window.addCategorySelect = function () {
    const categoryWrapper = document.getElementById("categories-wrapper");

    // Create a new select element
    const newSelect = document.createElement("select");
    newSelect.classList.add("form-control", "mt-2");

    // Populate the select element with the categories
    newSelect.innerHTML = [
      ...document.querySelectorAll("#categories-wrapper select option"),
    ]
      .map(
        (option) =>
          `<option value="${option.value}">${option.textContent}</option>`
      )
      .join("");

    // Append the new select element to the wrapper
    categoryWrapper.appendChild(newSelect);
  };

  // Remove specific category select element
  window.removeCategorySelect = function (selectElement) {
    const categoryWrapper = document.getElementById("categories-wrapper");
    if (categoryWrapper.children.length > 1) {
      categoryWrapper.removeChild(selectElement);
    } else {
      showToast("At least one category is required", "warning");
    }
  };

  // Fetch and display products
  async function fetchProducts() {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_PRODUCTS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const result = await response.json();

      if (result.success) {
        productTableBody.innerHTML = result.products
          .map(
            (product) => `
          <tr>
            <td>${product.code}</td>
            <td><img src="${
              product.imageUrl
            }" alt="Product Image" width="50" /></td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editProduct('${
                product._id
              }')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct('${
                product._id
              }')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        `
          )
          .join("");
      } else {
        showToast("Failed to fetch products", "danger");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("An error occurred while fetching products", "danger");
    } finally {
      hideSpinner();
    }
  }

  // Load categories and products on page load
  fetchCategories();
  fetchProducts();

  // Add or update product
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("productId").value;
    const productData = collectProductFormData();

    clearErrors();

    if (!productData.name || !productData.price) {
      showError("product-error", "Product name and price are required");
      return;
    }

    showSpinner();

    try {
      const url = productId
        ? `${ENDPOINTS.UPDATE_PRODUCT}/${productId}`
        : ENDPOINTS.ADD_PRODUCT;
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(productData),
      });
      const result = await response.json();

      if (result.success) {
        showToast(
          productId
            ? "Product updated successfully"
            : "Product added successfully",
          "success"
        );
        fetchProducts();
        clearInputs();
        hideForm(); // Hide form on successful add/update
      } else {
        console.error(result);
        showToast(
          "Failed to save product: " + (result.message || "Unknown error"),
          "danger"
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("An error occurred while saving product", "danger");
    } finally {
      hideSpinner();
    }
  });

  // Collect product form data
  function collectProductFormData() {
    return {
      name: document.getElementById("product-name").value,
      price: parseFloat(document.getElementById("price").value),
      categories: Array.from(
        document.querySelectorAll("#categories-wrapper select")
      ).map((select) => select.value),
      stock: {
        S: document.getElementById("stock-s").value,
        M: document.getElementById("stock-m").value,
        L: document.getElementById("stock-l").value,
        XL: document.getElementById("stock-xl").value,
      },
      salePrice: parseFloat(document.getElementById("sale-price").value),
      saleDuration: document.getElementById("sale-duration").value,
    };
  }

  // Edit product (populate the form with existing data)
  window.editProduct = function (id) {
    fetch(`${ENDPOINTS.GET_PRODUCT}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const product = result.product;
          document.getElementById("productId").value = product._id;
          document.getElementById("product-name").value = product.name;
          document.getElementById("price").value = product.price;
          formHeading.innerHTML = "Edit Product";
          showForm();
        }
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        showToast("An error occurred while fetching product data", "danger");
      });
  };

  // Delete product
  window.deleteProduct = async function (id) {
    if (confirm("Are you sure you want to delete this product?")) {
      showSpinner();

      try {
        const response = await fetch(`${ENDPOINTS.DELETE_PRODUCT}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        const result = await response.json();

        if (result.success) {
          showToast("Product deleted successfully", "success");
          fetchProducts();
        } else {
          showToast("Failed to delete product", "danger");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showToast("An error occurred while deleting product", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  // Show form and hide table
  window.showForm = function () {
    document.getElementById("productForm").classList.remove("d-none");
    document.getElementById("productTable").classList.add("d-none");
  };

  // Hide form and show table
  window.hideForm = function () {
    document.getElementById("productForm").classList.add("d-none");
    document.getElementById("productTable").classList.remove("d-none");
  };

  // Add product (reset form for adding a new product)
  window.addProduct = function () {
    document.getElementById("productId").value = "";
    clearInputs();
    formHeading.innerHTML = "Add Product";
    showForm();
  };

  // Search functionality for products
  document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = productTableBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const productName = row
        .querySelectorAll("td")[2]
        .textContent.toLowerCase();
      if (productName.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
});
