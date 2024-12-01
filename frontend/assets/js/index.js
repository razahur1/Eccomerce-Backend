import ENDPOINTS from "../../assets/js/config.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  renderStars,
  formatPrice,
  validateCustomSizeChart,
  renderRoundSizeOptions,
} from "../../assets/js/utils.js";
import { addToCart, addToWishlist } from "../../assets/js/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const newProductContainer = document.getElementById(
    "latest-arrivals-container"
  );

  const fetchNewArrival = async () => {
    try {
      showSpinner();
      const response = await fetch(ENDPOINTS.GET_NEW_ARRIVALS, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        newProductContainer.innerHTML = "";
        newProductContainer.innerHTML = result.newArrivals
          .map(
            (product) => `
           <!-- Product Item -->
        <div class="col-6 col-md-4 col-lg-3">
          <div class="product-card-2 rounded-3 overflow-hidden">
            <div class="product-card-image">
            <!-- Sale Badge -->
              ${
                product.highlights.sale
                  ? `<div class="badge-ribbon">
                   <span class="badge bg-danger">Sale</span>
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
                  <a class="btn btn-dark" onclick="addToCart('${
                    product._id
                  }')"><i class="fi-shopping-cart"></i></a>
                  <a  class="btn btn-dark" onclick="addToWishlist('${
                    product._id
                  }')"><i class="fi-heart"></i></a>
                  <a href="../product/product-details.html?productId=${
                    product._id
                  }" class="btn btn-dark"><i class="fi-eye"></i></a>
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
                    ? product.salePrice
                    : product.price
                }</span>
                ${
                  product.highlights.sale && product.salePrice !== null
                    ? `<del class="fs-sm text-muted">PKR ${product.price}</del>`
                    : ""
                }
              </div>
              <!-- Size Options with Stock Status -->
              <div class="nav-thumbs">
                ${renderRoundSizeOptions(product.sizes, product._id)}
              </div>
            </div>
          </div>
        </div>`
          )
          .join("");
      } else {
        showToast(result.message, "warning");
      }
    } catch (error) {
      console.error("Error fetching new arrival products:", error);
      showToast(
        error.message || "Failed to load new arrival products",
        "danger"
      );
    } finally {
      hideSpinner();
    }
  };

  fetchNewArrival();

  const fetchBestSeller = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_BEST_SELLERS, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const result = await response.json();

      const productContainer = document.querySelector("#best-seller-swiper");
      productContainer.innerHTML = result.bestSellers
        .map(
          (product) => `
            <div class="swiper-slide">
              <div class="product-card-2 rounded-3 overflow-hidden">
                <div class="product-card-image">
                  ${
                    product.highlights.sale
                      ? `<div class="badge-ribbon"><span class="badge bg-danger">Sale</span></div>`
                      : ""
                  }
                  <div class="product-media">
                    <a href="../product/product-details.html?productId=${
                      product._id
                    }">
                      <img class="img-fluid" src="${
                        product.images[0]?.url
                      }" alt="${product.name}" style="aspect-ratio: 1/1;" />
                    </a>
                    <div class="product-action nav justify-content-center">
                      <a  class="btn btn-dark" onclick="addToCart('${
                        product._id
                      }')"><i class="fi-shopping-cart"></i></a>
                      <a  class="btn btn-dark" onclick="addToWishlist('${
                        product._id
                      }')"><i class="fi-heart"></i></a>
                      <a href="../product/product-details.html?productId=${
                        product._id
                      }" class="btn btn-dark"><i class="fi-eye"></i></a>
                    </div>
                  </div>
                </div>
                <div class="product-card-info">
                  <div class="rating-star text">
                    ${renderStars(product.ratingsAverage)}
                  </div>
                  <h6 class="product-title"><a href="../product/product-details.html?productId=${
                    product._id
                  }">${product.name}</a></h6>
                  <div class="product-price">
                    <span class="text-primary">${
                      product.highlights.sale && product.salePrice !== null
                        ? formatPrice(product.salePrice)
                        : formatPrice(product.price)
                    }</span>
                    ${
                      product.highlights.sale && product.salePrice !== null
                        ? `<del class="fs-sm text-muted">${formatPrice(
                            product.price
                          )}</del>`
                        : ""
                    }
                  </div>
                   <!-- Size Options with Stock Status -->
                   <div class="nav-thumbs">
                    ${renderRoundSizeOptions(product.sizes, product._id)}
                   </div>
                </div>
              </div>
            </div>
          `
        )
        .join("");

      // Initialize Swiper after the DOM update
      initializeSwiper();
    } catch (error) {
      console.error("Error fetching best seller products:", error);
      showToast(
        error.message || "Failed to load best seller products",
        "danger"
      );
    }
  };

  function initializeSwiper() {
    new Swiper(".best-seller-swiper-container", {
      slidesPerView: 2,
      spaceBetween: 10,
      loop: true,
      navigation: {
        nextEl: ".swiper-next-02",
        prevEl: ".swiper-prev-02",
      },
      autoplay: {
        delay: 3500,
        disableOnInteraction: true,
      },
      breakpoints: {
        600: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      },
    });
  }

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

  // Call these functions when needed
  window.addToCart = (productId) => addToCart(productId);
  window.addToWishlist = (productId) => addToWishlist(productId);

  fetchBestSeller();
});


