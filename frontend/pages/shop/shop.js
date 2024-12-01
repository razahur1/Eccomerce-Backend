import ENDPOINTS from "../../assets/js/config.js";
import {
  showToast,
  updatePagination,
  renderStars,
  renderSizeOptions,
  validateCustomSizeChart,
  formatPrice,
} from "../../assets/js/utils.js";
import { addToCart, addToWishlist } from "../../assets/js/api.js";
import { getToken } from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoriesList = document.querySelector(".shop-categories-list ul"),
    selectedFilters = document.getElementById("selectedFilters"),
    sortByDropdownItems = document.querySelectorAll(
      ".shortby-dropdown .dropdown-item"
    );

  const fetchCategoriesFilter = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_CATEGORIES, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();

      if (result.categories && Array.isArray(result.categories)) {
        categoriesList.innerHTML = result.categories
          .map(
            ({ _id, name, productCount }) => `
              <li class="nav-item">
                <a href="#" class="nav-link" data-id="${_id}" data-name="${name.toLowerCase()}">${name} <span>(${productCount})</span></a>
              </li>`
          )
          .join("");

        categoriesList.querySelectorAll(".nav-link").forEach((link) => {
          link.addEventListener("click", (e) => {
            e.preventDefault();

            // Remove the 'active' class from all other category links
            categoriesList
              .querySelectorAll(".nav-link")
              .forEach((otherLink) => {
                otherLink.classList.remove("active");
              });

            // Add 'active' class to the clicked link
            link.classList.add("active");

            updateSelectedFilters();
            updateURLWithFilters();
          });
        });
      } else {
        showToast("No categories found", "warning");
      }
    } catch (error) {
      showToast(error, "danger");
    }
  };

  const updateSelectedFilters = () => {
    selectedFilters.innerHTML = "";
    const activeLinks = document.querySelectorAll(".nav-link.active"),
      checkboxes = document.querySelectorAll(
        "#shop_gender input:checked, #shop_highlights input:checked, #shop_price input:checked"
      ),
      filterList = document.createElement("ul");

    filterList.className = "list-unstyled d-flex flex-wrap";

    const addFilterItem = (text, onClick) => {
      const filterItem = document.createElement("li");
      filterItem.innerHTML = `<a href="#" class="filter-item">${text} <i class="bi bi-x"></i></a>`;
      filterItem
        .querySelector(".filter-item")
        .addEventListener("click", onClick);
      filterList.appendChild(filterItem);
    };

    activeLinks.forEach((link) =>
      addFilterItem(link.innerText.split(" (")[0], (e) => {
        e.preventDefault();
        link.classList.remove("active");
        updateSelectedFilters();
        updateURLWithFilters();
      })
    );

    checkboxes.forEach((checkbox) =>
      addFilterItem(checkbox.nextElementSibling.innerText, (e) => {
        e.preventDefault();
        checkbox.checked = false;
        updateSelectedFilters();
        updateURLWithFilters();
      })
    );

    if (filterList.childElementCount > 0) {
      const clearAll = document.createElement("li");
      clearAll.innerHTML =
        '<a class="clear-all" href="#">Clear All <i class="bi bi-x"></i></a>';
      clearAll
        .querySelector(".clear-all")
        .addEventListener("click", (event) => {
          event.preventDefault();
          document
            .querySelectorAll(".nav-link.active")
            .forEach((link) => link.classList.remove("active"));
          document
            .querySelectorAll(
              "#shop_gender input, #shop_highlights input, #shop_price input"
            )
            .forEach((input) => {
              input.checked = false;
            });
          updateSelectedFilters(); 
          updateURLWithFilters(); 
        });
      filterList.appendChild(clearAll);
    }

    selectedFilters.appendChild(filterList);
  };

  const updateURLWithFilters = () => {
    const params = new URLSearchParams(),
      activeLinks = [...document.querySelectorAll(".nav-link.active")].map(
        (link) => link.dataset.name.toLowerCase()
      ),
      checkedFilters = (selector) =>
        [...document.querySelectorAll(selector)].map((input) => input.value);

    if (activeLinks.length) params.append("category", activeLinks.join(","));
    if (checkedFilters("#shop_gender input:checked").length)
      params.append(
        "gender",
        checkedFilters("#shop_gender input:checked").join(",")
      );
    if (document.querySelector("#shop_price input:checked")) {
      const [minPrice, maxPrice] = document
        .querySelector("#shop_price input:checked")
        .value.split("-");
      params.append("minPrice", minPrice);
      params.append("maxPrice", maxPrice);
    }
    const highlightCheckboxes = document.querySelectorAll(
      "#shop_highlights input"
    );
    highlightCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        params.append(checkbox.getAttribute("data-highlight"), "true");
      }
    });

    const selectedSort = document.querySelector(
      ".shortby-dropdown .dropdown-item.active"
    );
    if (selectedSort) params.append("sortBy", selectedSort.dataset.sort);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newURL }, "", newURL);
    fetchFilteredProducts();
  };

  const applyFiltersFromURL = () => {
    const params = new URLSearchParams(window.location.search);

    const applyFilter = (param, selector, type = "link") => {
      (params.get(param)?.split(",") || []).forEach((value) => {
        const el = document.querySelector(
          `${selector}[data-name="${value.toLowerCase()}"], ${selector}[value="${value}"]`
        );
        if (el) {
          type === "link" ? el.classList.add("active") : (el.checked = true);
        }
      });
    };

    // Apply filters for categories and gender
    applyFilter("category", ".nav-link");
    applyFilter("gender", "#shop_gender input", "input");

    // Apply highlights from URL parameters
    const highlightCheckboxes = document.querySelectorAll(
      "#shop_highlights input"
    );
    highlightCheckboxes.forEach((checkbox) => {
      const highlightName = checkbox.getAttribute("data-highlight");
      const highlightValue = params.get(highlightName);
      if (highlightValue === "true") {
        checkbox.checked = true;
      }
    });

    // Apply price range filter
    const [minPrice, maxPrice] = [
      params.get("minPrice"),
      params.get("maxPrice"),
    ];
    if (minPrice || maxPrice) {
      document.querySelectorAll("#shop_price input").forEach((input) => {
        const [inputMin, inputMax] = input.value.split("-");
        if (inputMin === minPrice && inputMax === maxPrice)
          input.checked = true;
      });
    }

    // Apply sorting
    const sort = params.get("sortBy");
    if (sort) {
      const sortItem = document.querySelector(
        `.shortby-dropdown .dropdown-item[data-sort="${sort}"]`
      );
      if (sortItem) {
        sortItem.classList.add("active");
        document.getElementById(
          "dropdownMenuLink"
        ).textContent = `Sort by: ${sortItem.textContent}`;
      }
    }

    updateSelectedFilters();
  };

  await fetchCategoriesFilter();
  applyFiltersFromURL();

  document
    .querySelectorAll(
      "#shop_gender input, #shop_highlights input, #shop_price input"
    )
    .forEach((input) =>
      input.addEventListener("change", () => {
        updateSelectedFilters();
        updateURLWithFilters();
      })
    );

  sortByDropdownItems.forEach((item) =>
    item.addEventListener("click", (e) => {
      e.preventDefault();
      sortByDropdownItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(
        "dropdownMenuLink"
      ).textContent = `Sort by: ${item.textContent}`;
      updateURLWithFilters();
    })
  );

  const fetchFilteredProducts = async (page = 1, limit = 12) => {
    try {
      const params = new URLSearchParams(window.location.search);

      // Add pagination to the URL
      params.set("page", page);
      const newURL = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newURL }, "", newURL);

      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCTS}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        }
      );
      const result = await response.json();

      const productContainer = document.querySelector("#products-container");
      productContainer.innerHTML = result.products
        .map(
          (product) => `
           <!-- Product Item -->
        <div class="col-6 col-md-4 col-lg-4 my-3">
          <div class="product-card-2 overflow-hidden">
            <div class="product-card-image">
            <!-- Sale Badge -->
              ${
                product.highlights.sale
                  ? `<div class="badge-ribbon">
                   <span class="badge bg-warning">Sale</span>
                 </div>`
                  : ""
              }
              <!-- Product Image -->
              <div class="product-media">
                <a href="../product/product-details.html?productId=${
                  product._id
                }"><img class="img-fluid" src="${
            product.images[0]?.url
          }" alt="${product.name}" style="aspect-ratio:1/1;"/></a>
                 <!-- Product Actions -->
                <div class="product-action nav justify-content-center">
                  <a class="btn btn-primary" onclick="addToCart('${
                    product._id
                  }')"><i class="fi-shopping-cart"></i></a>
                  <a  class="btn btn-primary" onclick="addToWishlist('${
                    product._id
                  }')"><i class="fi-heart"></i></a>
                  <a href="../product/product-details.html?productId=${
                    product._id
                  }" class="btn btn-primary"><i class="fi-eye"></i></a>
                </div>
              </div>
            </div>
            <!-- Product Info -->
            <div class="product-card-info">
              <!-- Rating -->
              <div class="rating-star text">
                ${renderStars(product.ratingsAverage)}
              </div>
              <!-- Product Title -->
              <h6 class="product-title"><a href="../product/product-details.html?productId=${
                product._id
              }">${product.name}</a></h6>
              <!-- Product Price -->
              <div class="product-price">
                <span class="text-primary">PKR ${
                  product.highlights.sale && product.salePrice !== null
                    ? formatPrice(product.salePrice)
                    : formatPrice(product.price)
                }</span>
                ${
                  product.highlights.sale && product.salePrice !== null
                    ? `<del class="fs-sm text-muted">PKR ${formatPrice(
                        product.price
                      )}</del>`
                    : ""
                }
              </div>
              <!-- Size Options with Stock Status -->
              <div class="nav-thumbs">
                ${renderSizeOptions(product.sizes, product._id)}
              </div>
            </div>
          </div>
        </div>`
        )
        .join("");

      updatePagination(
        result.totalProducts,
        result.currentPage,
        limit,
        fetchFilteredProducts
      );
    } catch (error) {
      showToast(error, "danger");
    }
  };

  document
    .querySelector("#px_custom_size_chart_modal form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const { isValid, formData } = validateCustomSizeChart(
        "px_custom_size_chart_modal"
      );

      if (!isValid) {
        showToast("Please fill out all fields with positive values.");
        return;
      }

      const modal = bootstrap.Modal.getInstance(
        document.querySelector("#px_custom_size_chart_modal")
      );
      modal.hide();
    });

  fetchFilteredProducts();

  const token = getToken();

  // Call these functions when needed
  window.addToCart = (productId, quantity) => addToCart(productId, quantity);
  window.addToWishlist = (productId) => addToWishlist(productId);

  const closeButton = document.getElementById("closeSidebarButton");
  const offcanvas = new bootstrap.Offcanvas("#shop_filter");

  closeButton.addEventListener("click", () => {
    offcanvas.hide();
  });
});
