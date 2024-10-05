import ENDPOINTS from "../../assets/js/config.js";
import {
  showSpinner,
  hideSpinner,
  showToast,
  showConfirm,
  updatePagination,
} from "../../assets/js/utils.js";
import {
  checkUserAuth,
  loadUserInfo,
  logoutHandler,
} from "../../assets/js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkUserAuth()) {
    window.location.href = "../login/login.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = localStorage.getItem("token");

  let currentPage = 1;

  // Function to fetch wishlist products from the API
  const loadWishlistProducts = async (page = 1, limit = 3) => {
    try {
      const queryParams = new URLSearchParams({
        page: page,
        limit: limit,
      });

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

      if (result.success) {
        const products = result.wishlist;
        if (Array.isArray(products) && products.length > 0) {
          renderWishlistProducts(products);
          currentPage = result.currentPage;
          updatePagination(
            result.totalProducts,
            currentPage,
            limit,
            (newPage) => loadWishlistProducts(newPage, limit)
          );
        } else {
          showToast("No products found in wishlist", "warning");
        }
      } else {
        showToast(result.message);
      }
    } catch (error) {
      showToast("Error fetching wishlist products: " + error, "danger");
    }
  };

  // Function to render wishlist products
  const renderWishlistProducts = (products) => {
    const wishlistContainer = document.getElementById("wishlist-container");
    wishlistContainer.innerHTML = "";

    products.forEach((product) => {
      const salePrice = product.salePrice != null ? product.salePrice : 0;
      const price = product.price != null ? product.price : 0;

      // Conditionally render the sale badge
      const saleBadge = product.highlights.sale
        ? `<div class="badge-ribbon">
         <span class="badge bg-warning">Sale</span>
       </div>`
        : "";

      const productHTML = `
        <div class="col-6 col-md-3">
          <div class="product-card-1">
            <div class="product-card-image">
            ${saleBadge}
              <div class="product-media position-relative">
                <a href="../product/product-detail1.html?id=${product._id}">
                  <img class="img-fluid" src="${product.images[0].url}" alt="${
        product.name
      }" style="object-fit: cover;"/>
                </a>
                <div class="shop-cart-icon position-absolute">
                  <a href="javascript:void(0)" onclick="addToCart('${
                    product._id
                  }')">
                    <i class="bi bi-cart3"></i>
                  </a>
                </div>
                <div class="product-cart-btn">
                  <button class="btn btn-danger btn-sm w-100"onclick="removeFromWishlist('${
                    product._id
                  }')">
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
                <a href="../product/product-detail1.html?id=${product._id}">${
        product.name
      }</a>
              </h6>
              <div class="product-price">
                ${
                  product.highlights.sale
                    ? `<span class="text-primary">$${salePrice.toFixed(
                        2
                      )}</span>
                    <del class="fs-sm text-muted">$${price.toFixed(2)}</del>`
                    : `<span class="text-primary">$${price.toFixed(2)}</span>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
      wishlistContainer.innerHTML += productHTML;
    });
  };

  // Function to render stars based on the rating
  window.renderStars = function (rating) {
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
      starsHTML += `<i class="bi bi-star${
        i <= rating ? "-fill active" : ""
      }"></i>`;
    }
    return starsHTML;
  };

  // Function to remove a product from the wishlist
  window.removeFromWishlist = async function (productId) {
    const userConfirmed = await showConfirm(
      "Are you sure you want to remove this product from your wishlist?"
    );
    if (userConfirmed) {
      try {
        const response = await fetch(
          `${ENDPOINTS.REMOVE_WISHLIST}/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const result = await response.json();

        if (result.success) {
          showToast("Product removed from wishlist", "success");
          loadWishlistProducts(currentPage);
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        showToast("Error removing product from wishlist: " + error, "danger");
      }
    }
  };

  // Function to add product to cart
  window.addToCart = async function (productId) {
    const userConfirmed = await showConfirm(
      "Do you want to Add this product in your cart?"
    );
    if (userConfirmed) {
      try {
        const response = await fetch(`${ENDPOINTS.ADD_TO_CART}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
          body: JSON.stringify({ productId, quantity: 1, size: "S" }),
        });

        const result = await response.json();

        if (result.success) {
          showToast("Product added to cart", "success");
        } else {
          showToast("Failed to add product to cart", "danger");
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
        showToast("An error occurred while adding product to cart", "danger");
      }
    }
  };

  loadWishlistProducts();

  // setInterval(() => {
  //   loadWishlistProducts(currentPage);
  // }, 10000);
});
