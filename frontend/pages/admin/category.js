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
  showConfirm,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");

  const categoryForm = document.getElementById("addEditCategoryForm");
  const categoryTableBody = document.querySelector("#categoryTableBody");
  const CategoryformHeading = document.getElementById("CategoryformTitle");

  // Fetch and display all categories with product count on page load
  async function fetchCategories() {
    try {
      showSpinner();

      const response = await fetch(ENDPOINTS.GET_CATEGORIES, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        categoryTableBody.innerHTML = result.categories
          .map(
            (category) => `
          <tr class="text-center align-middle">
            <td>${category.code}</td>
            <td>${category.name}</td>
            <td>${
              category.productCount || 0
            }</td> <!-- Display product count -->
            <td>
              <button class="btn btn-sm btn-warning" onclick="editCategory('${
                category._id
              }', '${category.name}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteCategory('${
                category._id
              }')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        `
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

  // Load categories on page load
  fetchCategories();

  // Add or update category
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const categoryId = document.getElementById("categoryId").value;
      const categoryName = document.getElementById("categoryName").value.trim();

      clearErrors();

      if (!categoryName) {
        showError("category-error", "Category name is required");
        return;
      }

      showSpinner();

      try {
        const url = categoryId
          ? `${ENDPOINTS.UPDATE_CATEGORY}/${categoryId}`
          : ENDPOINTS.ADD_CATEGORY;
        const method = categoryId ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
          body: JSON.stringify({ name: categoryName }),
        });
        const result = await response.json();

        if (result.success) {
          showToast(
            categoryId
              ? "Category updated successfully"
              : "Category added successfully",
            "success"
          );
          fetchCategories();
          clearInputs();
          hideCategoryForm(); // Hide the form on successful add/update
        } else {
          console.error(result); // Log the result for debugging
          showToast(
            "Failed to save category: " + (result.message || "Unknown error"),
            "danger"
          );
        }
      } catch (error) {
        console.error("Error saving category:", error);
        showToast("An error occurred while saving category", "danger");
      } finally {
        hideSpinner();
      }
    });
  }

  // Edit category (populate the form with existing data)
  window.editCategory = function (id, name) {
    document.getElementById("categoryId").value = id;
    document.getElementById("categoryName").value = name;
    CategoryformHeading.innerHTML = "Edit Category"; // Change heading to Edit Category
    showCategoryForm(); // Ensure the form is visible when editing
  };

  // Delete category
  window.deleteCategory = async function (id) {
    const userConfirmed = await showConfirm(
      "Are you sure you want to delete this category?"
    );
    if (userConfirmed) {
      showSpinner();

      try {
        const response = await fetch(`${ENDPOINTS.DELETE_CATEGORY}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          showToast("Category deleted successfully", "success");
          fetchCategories();
        } else {
          showToast( result.message, "danger");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        showToast("An error occurred while deleting category", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  // Show table and hide form functions
  window.hideCategoryForm = function () {
    document.getElementById("categoryTable").classList.remove("d-none");
    document.getElementById("categoryForm").classList.add("d-none");
  };

  // Show form and hide table functions
  window.showCategoryForm = function () {
    document.getElementById("categoryForm").classList.remove("d-none");
    document.getElementById("categoryTable").classList.add("d-none");
  };

  // Add category (reset form for adding a new category)
  window.addCategory = function () {
    document.getElementById("categoryId").value = "";
    document.getElementById("categoryName").value = "";
    CategoryformHeading.innerHTML = "Add Category"; // Change heading to Add Category
    showCategoryForm(); // Show the form when adding
  };

  const categorySearchInput = document.getElementById("categorySearchInput");
  if (categorySearchInput) {
    // Search functionality for categories
    categorySearchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const rows = categoryTableBody.querySelectorAll("tr");

      rows.forEach((row) => {
        const categoryCode = row
          .querySelectorAll("td")[0]
          .textContent.toLowerCase();
        const categoryName = row
          .querySelectorAll("td")[1]
          .textContent.toLowerCase();
        if (
          categoryName.includes(searchTerm) ||
          categoryCode.includes(searchTerm)
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
});
