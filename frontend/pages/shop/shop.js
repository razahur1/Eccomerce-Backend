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

// document.addEventListener("DOMContentLoaded", () => {

//   async function fetchCategoriesFilter() {
//     try {
//       const response = await fetch(ENDPOINTS.GET_CATEGORIES, {
//         method: "GET",
//         headers: {
//           "Cache-Control": "no-cache",
//         },
//       });
//       const result = await response.json();

//       if (result.success) {
//         populateCategoriesFilter(result.categories);
//       } else {
//         console.error("Failed to fetch categories:", result.message);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   }

//   function populateCategoriesFilter(categories) {
//     const categoriesList = document.querySelector(
//       ".shop-categories-list .shop-attr-body ul"
//     );

//     // Clear existing categories if any
//     categoriesList.innerHTML = "";

//     // Create and append category items
//     categories.forEach((category) => {
//       const listItem = document.createElement("li");
//       listItem.className = "nav-item";
//       listItem.innerHTML = `
//           <a href="#" class="nav-link">${category.name} <span>(${category.productCount})</span></a>
//         `;
//       categoriesList.appendChild(listItem);
//     });
//   }

//   fetchCategoriesFilter();
// });

document.addEventListener("DOMContentLoaded", () => {
  // Fetch categories from your API

  // Update selected filters display
  function updateSelectedFilters() {
    const selectedFilters = document.getElementById("selectedFilters");
    selectedFilters.innerHTML = ""; // Clear previous filters

    const checkboxes = document.querySelectorAll(
      "#categoryList input:checked, #shop_gender input:checked, #shop_highlights input:checked, #shop_price input:checked"
    );

    const filterList = document.createElement("ul");
    filterList.className = "list-unstyled d-flex flex-wrap"; // Add flex-wrap class to keep it in one line

    // Show "Clear All" link if there are selected filters
    if (checkboxes.length > 0) {
      const clearAll = document.createElement("li");
      clearAll.innerHTML =
        '<a class="clear-all" href="#">Clear All <i class="bi bi-x"></i></a>';
      clearAll
        .querySelector(".clear-all")
        .addEventListener("click", (event) => {
          event.preventDefault();
          clearAllFilters(); // Function to clear all filters
        });
      filterList.appendChild(clearAll);
    }

    // Add selected filters to the display
    checkboxes.forEach((checkbox) => {
      const filterItem = document.createElement("li");
      filterItem.innerHTML = `
        <a href="#" class="filter-item">${checkbox.nextElementSibling.innerText} <i class="bi bi-x"></i></a>
      `;
      filterItem
        .querySelector(".filter-item")
        .addEventListener("click", (event) => {
          event.preventDefault();
          checkbox.checked = false; // Uncheck the checkbox
          updateSelectedFilters(); // Update the filter display
          // Optionally fetch filtered products
        });
      filterList.appendChild(filterItem);
    });

    selectedFilters.appendChild(filterList); // Append the list to selectedFilters
  }

  function clearAllFilters() {
    // Uncheck all checkboxes
    document
      .querySelectorAll(
        "#categoryList input, #shop_gender input, #shop_highlights input, #shop_price input"
      )
      .forEach((input) => {
        input.checked = false;
      });
    updateSelectedFilters(); // Update the filter display
    // Optionally fetch filtered products
  }

  function updateURLWithFilters() {
    const selectedCategories = [
      ...document.querySelectorAll("#categoryList input:checked"),
    ].map((checkbox) => checkbox.value);
    const selectedGender = [
      ...document.querySelectorAll("#shop_gender input:checked"),
    ].map((checkbox) => checkbox.value);
    const selectedHighlights = [
      ...document.querySelectorAll("#shop_highlights input:checked"),
    ].map((checkbox) => checkbox.value);

    const selectedPrice =
      document.querySelector("#shop_price input:checked").value || "";
    const [minPrice, maxPrice] = selectedPrice.split("-");

    const urlParams = new URLSearchParams();

    if (selectedCategories.length)
      urlParams.append("categories", selectedCategories.join(","));
    if (selectedGender.length)
      urlParams.append("gender", selectedGender.join(","));
    if (selectedHighlights.length)
      urlParams.append("highlights", selectedHighlights.join(","));
    if (minPrice) urlParams.append("minPrice", minPrice);
    if (maxPrice) urlParams.append("maxPrice", maxPrice);

    const newURL = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newURL }, "", newURL);
    fetchFilteredProducts();
  }

  document
    .querySelectorAll(
      "#categoryList input, #shop_gender input, #shop_highlights input, #shop_price input"
    )
    .forEach((input) => {
      input.addEventListener("change", () => {
        updateSelectedFilters();
        updateURLWithFilters();
      });
    });
});
