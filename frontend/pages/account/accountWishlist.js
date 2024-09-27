import ENDPOINTS from "../../assets/js/config.js";
import {
  showSpinner,
  hideSpinner,
  showToast,
  showConfirm,
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

  // Function to fetch wishlist products from the API
  const loadWishlistProducts = async () => {
    showSpinner();
    try {
      const response = await fetch(ENDPOINTS.GET_WISHLIST, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });

      const result = await response.json();
      console.log(result); // Debugging line

      if (result.success) {
        // Access products from the nested wishlist object
        const products = result.wishlist.products;
        if (Array.isArray(products) && products.length > 0) {
          renderWishlistProducts(products);
        } else {
          showToast("No products found in wishlist", "warning");
        }
      } else {
        showToast(result.message);
      }
    } catch (error) {
      showToast("Error fetching wishlist products: " + error, "danger");
    } finally {
      hideSpinner();
    }
  };

  // Function to render wishlist products
  const renderWishlistProducts = (products) => {
    const wishlistContainer = document.getElementById("wishlist-container");
    wishlistContainer.innerHTML = "";

    products.forEach((product) => {
      const salePrice = product.salePrice != null ? product.salePrice : 0;
      const price = product.price != null ? product.price : 0;
      const productHTML = `
        <div class="col-6 col-md-3">
          <div class="product-card-1">
            <div class="product-card-image">
              <div class="product-media position-relative">
                <a href="../product/product-detail1.html?id=${product._id}">
                  <img class="img-fluid" src="${product.images[0].url}" alt="${
        product.name
      }" style="height: 150px; width: 200px; object-fit: cover;"/>
                </a>
                <div class="shop-cart-icon position-absolute">
                  <a href="../shop/shop-cart.html">
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
          loadWishlistProducts();
        } else {
          showToast(result.message, "danger");
        }
      } catch (error) {
        showToast("Error removing product from wishlist: " + error, "danger");
      }
    }
  };

  loadWishlistProducts();
});
