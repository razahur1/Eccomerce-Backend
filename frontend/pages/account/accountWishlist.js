import ENDPOINTS from "../../assets/js/config.js";
import {
  showSpinner,
  hideSpinner,
  showToast,
  showConfirm,
  updatePagination,
  renderStars,
  formatPrice,
  getPageFromURL,
  updatePageInURL,
} from "../../assets/js/utils.js";
import {
  checkUserAuth,
  getToken,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
    return;
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();
  const currentPage = getPageFromURL();

  const wishlistContainer = document.getElementById("wishlist-container");

  const loadWishlistProducts = async (page = 1, limit = 12) => {
    showSpinner();
    try {
      const queryParams = new URLSearchParams({ page, limit });
      const response = await fetch(
        `${ENDPOINTS.GET_WISHLIST}?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      console.log(result);
      if (!result.success) {
        showToast(result.message || "Failed to load wishlist", "danger");
        return;
      }

      const {
        wishlist: products = [],
        totalProducts = 0,
        currentPage: newPage = 1,
        totalPages,
      } = result;
      // Redirect to the last page if current page exceeds total pages
      if (page > totalPages && totalPages > 0) {
        window.location.href = `${window.location.pathname}?page=${totalPages}`; // Redirect to the last page
        return; // Exit the function
      }

      // Render products if available
      if (products.length > 0) {
        renderWishlistProducts(products);
        updatePagination(totalProducts, newPage, limit, (newPage) =>
          loadWishlistProducts(newPage, limit)
        );
        updatePageInURL(newPage);
      } else {
        wishlistContainer.innerHTML = `
        <div class="text-center my-5">
          <div class="mb-3">
            <i class="fas fa-heart fa-3x text-muted"></i>
          </div>
          <hr>
          <h5 class="text-muted">Your Wishlist is Empty</h5>
          <p class="text-secondary">It seems you haven't added any items to your wishlist yet. Start browsing and add your favorite products!</p>
        </div>
      `;
      }
    } catch (error) {
      showToast(
        `Error fetching wishlist products: ${
          error.message || "Unknown error occurred"
        }`,
        "danger"
      );
    } finally {
      hideSpinner(); // Always hide the spinner after fetching
    }
  };

  const renderProductPrice = (price, salePrice, isOnSale) => {
    return isOnSale
      ? `<span class="text-primary">${formatPrice(salePrice)}</span>
         <del class="fs-sm text-muted">${formatPrice(price)}</del>`
      : `<span class="text-primary">${formatPrice(price)}</span>`;
  };

  const renderWishlistProducts = (products) => {
    const productCards = products
      .map((product) => {
        const salePrice = product.salePrice ?? 0;
        const price = product.price ?? 0;
        const saleBadge = product.highlights.sale
          ? `<div class="badge-ribbon"><span class="badge bg-warning">Sale</span></div>`
          : "";

        return `
      <div class="col-6 col-md-3" data-product-id="${product._id}">
        <div class="product-card-1">
          <div class="product-card-image">
            ${saleBadge}
            <div class="product-media position-relative">
              <a href="../product/product-details.html?productId=${
                product._id
              }">
                <img class="img-fluid" src="${product.images[0].url}" alt="${
          product.name
        }" style="aspect-ratio:1/1;"/>
              </a>
              <div class="product-cart-btn">
                <button class="btn btn-danger btn-sm w-100 remove-btn">
                  <i class="bi bi-x-circle"></i> Remove
                </button>
              </div>
            </div>
          </div>
          <div class="product-card-info">
            <div class="rating-star text">
              ${renderStars(product.ratingsAverage)}
            </div>
            <h6 class="product-title">
              <a href="../product/product-details.html?productId=${
                product._id
              }">${product.name}</a>
            </h6>
            <div class="product-price">
              ${renderProductPrice(price, salePrice, product.highlights.sale)}
            </div>
          </div>
        </div>
      </div>
    `;
      })
      .join(""); // Use array join for better performance

    wishlistContainer.innerHTML = productCards; // Update wishlist container once

    // Attach event listener for removing products using event delegation
    wishlistContainer.addEventListener("click", async (event) => {
      if (event.target.closest(".remove-btn")) {
        const productId =
          event.target.closest("[data-product-id]").dataset.productId;
        await removeFromWishlist(productId);
      }
    });
  };

  const removeFromWishlist = async (productId) => {
    const userConfirmed = await showConfirm(
      "Are you sure you want to remove this product from your wishlist?"
    );
    if (userConfirmed) {
      try {
        showSpinner();
        const response = await fetch(`${ENDPOINTS.REMOVE_FROM_WISHLIST}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });

        const result = await response.json();
        if (result.success) {
          showToast("Product removed from wishlist", "success");
          loadWishlistProducts(currentPage); // Reload wishlist
        } else {
          showToast(
            result.message || "Error removing product from wishlist",
            "danger"
          );
        }
      } catch (error) {
        showToast(
          `Error removing product from wishlist: ${error.message || error}`,
          "danger"
        );
      } finally {
        hideSpinner();
      }
    }
  };

  loadWishlistProducts(currentPage);
});
