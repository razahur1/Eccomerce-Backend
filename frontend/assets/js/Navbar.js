import { checkUserAuth, getToken } from "./auth.js";
import ENDPOINTS from "./config.js";
import { GetWishlistAndCartCounts } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const unauthenticatedLinks = document.getElementById("unauthenticated-links");
  const authenticatedLinks = document.getElementById("authenticated-links");
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const searchForm = document.getElementById("searchForm");
  let debounceTimer;

  if (checkUserAuth()) {
    GetWishlistAndCartCounts();
    unauthenticatedLinks.style.display = "none";
    authenticatedLinks.style.display = "block";
  } else {
    unauthenticatedLinks.style.display = "block";
    authenticatedLinks.style.display = "none";
  }

  // Function to fetch suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCTS}?search=${query}&limit=5`
      );
      const data = await response.json();

      if (data.success) {
        // Clear suggestions
        searchSuggestions.innerHTML = "";

        if (data.products.length > 0) {
          // Add category heading
          searchSuggestions.innerHTML += `
            <li class="dropdown-header">Products</li>
          `;

          // Add products to the dropdown
          data.products.forEach((product) => {
            const categories =
              product.category.map((category) => category.name).join(", ") ||
              "Uncategorized";

            searchSuggestions.innerHTML += `
              <li>
                <a
                  href="../../pages/product/product-details.html?productId=${product._id}"
                  class="dropdown-item"
                >
                  <strong>${product.name}</strong> 
                   <small class="text-muted d-block">${categories}</small>
                </a>
              </li>
            `;
          });

          // Add a "View All Results" link
          searchSuggestions.innerHTML += `
            <li>
              <a
                href="../../pages/shop/shop.html?search=${encodeURIComponent(
                  query
                )}"
                class="dropdown-item text-primary"
              >
                <i class="fi-search"></i> View all results for "${query}"
              </a>
            </li>
          `;
        } else {
          // No results found
          searchSuggestions.innerHTML = `
            <li class="dropdown-header">No results found</li>
            <li class="dropdown-item">
              Try searching with different keywords or check popular searches.
            </li>
          `;
        }

        searchSuggestions.style.display = "block";
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Debounce function to limit API calls
  const debounce = (callback, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(callback, delay);
  };

  // Handle input changes
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      debounce(() => fetchSuggestions(query), 300);
    } else {
      searchSuggestions.style.display = "none";
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target)) {
      searchSuggestions.style.display = "none";
    }
  });

  // Handle form submission
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `../../pages/shop/shop.html?search=${encodeURIComponent(
        query
      )}`;
    }
  });
});
