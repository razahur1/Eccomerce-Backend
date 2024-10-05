import ENDPOINTS from "../../assets/js/config.js";
import { checkUserAuth } from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  showConfirm,
  updatePagination,
} from "../../assets/js/utils.js";

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

      categoriesList.innerHTML = result.categories
        .map(
          ({ _id, name, productCount }) => `
        <li class="nav-item">
          <a href="#" class="nav-link" data-id="${_id}">${name} <span>(${productCount})</span></a>
        </li>`
        )
        .join("");

      categoriesList.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          link.classList.toggle("active");
          updateSelectedFilters();
          updateURLWithFilters();
        });
      });
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
          updateSelectedFilters(); // Clear selected filters
          updateURLWithFilters(); // Clear URL filters
        });
      filterList.appendChild(clearAll);
    }

    selectedFilters.appendChild(filterList);
  };

  const updateURLWithFilters = () => {
    const params = new URLSearchParams(),
      activeLinks = [...document.querySelectorAll(".nav-link.active")].map(
        (link) => link.dataset.id
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
          `${selector}[data-id="${value}"], ${selector}[value="${value}"]`
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
        <div class="col-6 col-md-4 col-xl-3 my-3">
          <div class="product-card-2">
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
                  <a href="#" class="btn btn-primary" onclick="addToCart('${
                    product._id
                  }')"><i class="fi-shopping-cart"></i></a>
                  <a href="#" class="btn btn-primary" onclick="addToWishlist('${
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
                ${generateRatingStars(product.ratingsAverage)}
              </div>
              <!-- Product Title -->
              <h6 class="product-title"><a href="../product/product-details.html?productId=${
                product._id
              }">${product.name}</a></h6>
              <!-- Product Price -->
              <div class="product-price">
                <span class="text-primary">PKR ${
                  product.highlights.sale && product.salePrice !== null ? product.salePrice : product.price
                }</span>
                ${
                  product.highlights.sale && product.salePrice !== null
                    ? `<del class="fs-sm text-muted">PKR ${product.price}</del>`
                    : ""
                }
              </div>
              <!-- Size Options with Stock Status -->
              <div class="nav-thumbs">
                ${generateSizeOptions(product.sizes, product._id)}
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

  const generateSizeOptions = (sizes, productId) => {
    return sizes
      .map(
        (size) => `
    <div class="form-check radio-text form-check-inline position-relative">
      <input
        class="form-check-input"
        type="radio"
        name="size_${productId}" // Use the productId for the name to group sizes by product
        id="size_${size._id}" // Use the size id for unique identification
        value="${size.size}"
        ${size.stock === 0 ? "disabled" : ""}
      />
      <label class="radio-text-label" for="size_${size._id}">${
          size.size
        }</label>
      ${
        size.stock === 0
          ? `<span class="position-absolute top-50 start-0 w-100" style="height: 1px; background-color: rgb(247, 83, 83); transform: rotate(-45deg);"></span>`
          : ""
      }
    </div>`
      )
      .join("");
  };

  const generateRatingStars = (rating) => {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="bi bi-star${i <= rating ? "-fill active" : ""}"></i>`;
    }
    return stars;
  };

  fetchFilteredProducts();

  const token = localStorage.getItem("token");

  window.addToCart = async (productId) => {
    if (!checkUserAuth()) {
      //window.location.href = "../login/login.html";
      showToast("Please Login First....!", "warning");
      return;
    }

    const selectedSize = document.querySelector(
      `input[name="size_${productId}"]:checked`
    );

    if (!selectedSize) {
      showToast("Please select a size before adding to the cart.", "warning");
      return;
    }

    const size = selectedSize.value;

    try {
      showSpinner();
      const response = await fetch(`${ENDPOINTS.ADD_TO_CART}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1, size }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Product added to cart", "success");
      } else {
        showToast(result.error, "warning");
      }
    } catch (error) {
      showToast("Error adding product to cart: " + error, "danger");
    } finally {
      hideSpinner();
    }
  };

  window.addToWishlist = async (productId) => {
    if (!checkUserAuth()) {
      //window.location.href = "../login/login.html";
      showToast("Please Login First....!", "warning");
      return;
    }

    try {
      showSpinner();
      const response = await fetch(`${ENDPOINTS.ADD_TO_WISHLIST}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Product added to your wishlist", "success");
      } else {
        showToast(result.error, "warning");
      }
    } catch (error) {
      showToast("Error adding product to wishlist: " + error, "danger");
    } finally {
      hideSpinner();
    }
  };
});
