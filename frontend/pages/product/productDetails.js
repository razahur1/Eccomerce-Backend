import { checkUserAuth, getToken } from "../../assets/js/auth.js";
import ENDPOINTS from "../../assets/js/config.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  renderStars,
  renderSizeOptions,
  formatPrice,
  validateCustomSizeChart,
} from "../../assets/js/utils.js";
import { addToCart, addToWishlist } from "../../assets/js/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("productId");
  }

  const productId = getProductIdFromURL();

  const token = getToken();

  async function isProductInWishlist(productId) {
    const response = await fetch(`${ENDPOINTS.CHECK_WiSHLIST}/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
      return data.isInWishlist; // Return whether the product is in the wishlist
    }

    return false; // Default to false if the request was not successful
  }

  const wishlistButton = document.getElementById("wishlist-button");

  if (token) {
    var isInWishlist = await isProductInWishlist(productId);
    if (isInWishlist) {
      wishlistButton.classList.add("active");
    } else {
      wishlistButton.classList.remove("active");
    }
  }

  async function toggleWishlist(productId, isInWishlist) {
    if (!checkUserAuth()) {
      //window.location.href = "../login/login.html";
      showToast("Please Login First....!", "warning");
      return;
    }
    const endpoint = isInWishlist
      ? ENDPOINTS.REMOVE_FROM_WISHLIST
      : ENDPOINTS.ADD_TO_WISHLIST;
    const method = isInWishlist ? "DELETE" : "POST";

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Authorization: token,
      },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();
    showToast(data.message || data.error);
    return data.success;
  }

  // Handle wishlist button click
  wishlistButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // Toggle wishlist status
    const success = await toggleWishlist(productId, isInWishlist);
    if (success) {
      if (isInWishlist) {
        wishlistButton.classList.remove("active");
      } else {
        wishlistButton.classList.add("active");
      }
      isInWishlist = !isInWishlist;
    } else {
      console.error("Failed to update wishlist");
    }
  });

  // Function to fetch product details from the API
  async function fetchProductDetails() {
    if (!productId) {
      showToast("Product ID not found in URL", "danger");
      return;
    }

    try {
      const response = await fetch(`${ENDPOINTS.GET_PRODUCT}/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();

      if (result.success) {
        const product = result.product;
        displayProduct(product);
      } else {
        showToast(result.message, "warning");
      }
    } catch (error) {
      showToast("Error fetching product details:" + error, "danger");
    }
  }

  // Function to display product data dynamically
  function displayProduct(product) {
    // Update gallery images
    const galleryImages = document.querySelector(".gallery-images");
    const galleryThumbnails = document.querySelector(".gallery-thumbnails");

    product.images.forEach((image) => {
      galleryImages.innerHTML += `
    <div class="swiper-slide">
      <div class="pd-gallery-slide">
        <a class="gallery-link" href="${image.url}">
          <i class="bi bi-arrows-fullscreen"></i>
        </a>
        <img src="${image.url}" class="img-fluid" alt="" />
      </div>
    </div>
  `;

      galleryThumbnails.innerHTML += `
    <div class="swiper-slide">
      <div class="pd-gallery-slide-thumb">
        <img src="${image.url}" class="img-fluid" alt="" />
      </div>
    </div>
  `;
    });

    // Update product details
    document.querySelector(".product-name").textContent = product.name;
    document.querySelector(".description").textContent = product.intro;
    document.querySelector(".rating").innerHTML = renderStars(
      product.ratingsAverage
    );
    document.querySelector(".review-count").textContent = product.ratingsCount;

    // Update size options
    const sizeContainer = document.querySelector(".sizes");
    const selectedSizeDisplay = document.querySelector(".selected-size");

    // Clear existing size options before rendering new ones
    sizeContainer.innerHTML = ""; // Clear existing sizes
    // Render sizes with radio buttons
    product.sizes.forEach((size, _id) => {
      sizeContainer.innerHTML += `
    <div class="form-check radio-text form-check-inline position-relative">
      <input class="form-check-input" type="radio" name="size_${
        product._id
      }" id="size_${size._id}" value="${size.size}" ${
        _id === 0 ? "checked" : ""
      } ${size.stock === 0 ? "disabled" : ""}>
      <label class="radio-text-label" for="size_${size._id}">${
        size.size
      }</label>
      ${
        size.stock === 0
          ? `<span class="position-absolute top-50 start-0 w-100" style="height: 1px; background-color: rgb(247, 83, 83); transform: rotate(-45deg);"></span>`
          : ""
      }
    </div>`;
    });

    // Add Custom Size option
    sizeContainer.innerHTML += `
  <div class="form-check radio-text form-check-inline position-relative">
     <input
        class="form-check-input"
        type="radio"
        name="size_${productId}"
        id="custom_size_${productId}" // Unique ID for custom size
        value="CUSTOM"
        data-bs-toggle="modal"
        data-bs-target="#px_custom_size_chart_modal"
      />
      <label class="radio-text-label" for="custom_size_${productId}" style="font-size: 8px; padding: 3px; text-align:center">CUSTOM <br/> SIZE</label>
  </div>`;

    // Set initial selected size based on the default checked size
    const initialSize = document.querySelector(
      `input[name="size_${product._id}"]:checked`
    );
    if (initialSize) {
      selectedSizeDisplay.textContent = initialSize.value;
    }

    // Add event listener to update the selected size display
    sizeContainer.addEventListener("change", function (e) {
      if (e.target && e.target.name.startsWith("size_")) {
        // Update the selected size display
        selectedSizeDisplay.textContent = e.target.value;
      }
    });

    // Update price based on sale status
    document.querySelector(".product-price").innerHTML = `
        ${
          product.highlights.sale && product.salePrice !== null
            ? `<del class="text-muted original-price">${formatPrice(
                product.price
              )}</del>`
            : ""
        }
        <span class="text-primary sale-price">
        ${
          product.highlights.sale
            ? formatPrice(product.salePrice)
            : formatPrice(product.price)
        }
        </span>
        `;

    if (product.highlights.sale) {
      startCountdown(product.saleEndDate);
    } else {
      document.querySelector(".pd-count-down").style.display = "none";
    }

    // Update categories
    if (Array.isArray(product.category) && product.category.length > 0) {
      const categoriesContainer = document.querySelector(
        ".theme-link.mb-2:nth-of-type(1)"
      );
      categoriesContainer.innerHTML += " "; // Add space before adding links

      product.category.forEach((cat, index) => {
        categoriesContainer.innerHTML += `<a href="#">${cat.name}</a>${
          index < product.category.length - 1 ? ", " : ""
        }`;
      });
    } else {
      document.querySelector(".theme-link.mb-2:nth-of-type(1)").innerHTML +=
        "No categories available.";
    }

    // Update tags
    if (Array.isArray(product.tags) && product.tags.length > 0) {
      const tagsContainer = document.querySelector(
        ".theme-link.mb-2:nth-of-type(2)"
      );
      tagsContainer.innerHTML += " "; // Add space before adding links

      product.tags.forEach((tag, index) => {
        tagsContainer.innerHTML += `<a href="#">${tag}</a>${
          index < product.tags.length - 1 ? ", " : ""
        }`;
      });
    } else {
      document.querySelector(".theme-link.mb-2:nth-of-type(2)").innerHTML +=
        "No tags available.";
    }

    //update detail desciption
    document.querySelector(".detail-description").innerHTML =
      product.description;
    document.querySelector(".desc-img").src = product.images[0].url;

    // update review tabs
    document.querySelector("#review-info").innerHTML = `${renderStars(
      product.ratingsAverage
    )} 
    <span>${product.ratingsAverage.toFixed(2)}/5 (${
      product.ratingsCount
    } Reviews)</span>`;
  }

  // Initialize Swiper for thumbnails
  const thumbnailSwiper = new Swiper(".swiper_thumb_gallery_v", {
    direction: "vertical",
    slidesPerView: 5.5, // Adjust based on your design
    spaceBetween: 10,
  });

  // Add functionality to buttons
  document.querySelector(".swiper-prev").addEventListener("click", () => {
    thumbnailSwiper.slidePrev();
  });

  document.querySelector(".swiper-next").addEventListener("click", () => {
    thumbnailSwiper.slideNext();
  });

  // custom countdown logic
  function startCountdown(endDate) {
    const countDownDate = new Date(endDate).getTime();

    // Check if the countdown date is valid
    if (isNaN(countDownDate)) {
      return;
    }

    const daysElement = document.getElementById("count-days");
    const hoursElement = document.getElementById("count-hours");
    const minutesElement = document.getElementById("count-minutes");
    const secondsElement = document.getElementById("count-seconds");

    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
      return;
    }

    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(x);
        daysElement.textContent = "0";
        hoursElement.textContent = "0";
        minutesElement.textContent = "0";
        secondsElement.textContent = "0";
        return;
      }

      // Calculate time components
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Update countdown elements
      daysElement.textContent = days;
      hoursElement.textContent = hours;
      minutesElement.textContent = minutes;
      secondsElement.textContent = seconds;
    }, 1000);
  }

  fetchProductDetails();

  // Function to update quantity
  const quantityInput = document.querySelector(".cart-qty-input");
  const incrementButton = document.querySelector(".inc");
  const decrementButton = document.querySelector(".dec");

  // Set initial quantity value
  let quantity = 1;

  // Event listener for increment button
  incrementButton.addEventListener("click", () => {
    quantity++;
    quantityInput.value = quantity;
  });

  // Event listener for decrement button
  decrementButton.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      quantityInput.value = quantity;
    }
  });

  // Event listener for input change
  quantityInput.addEventListener("change", (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      quantity = value;
    } else {
      quantity = 1; // Reset to 1 if invalid input
    }
    quantityInput.value = quantity;
  });

  document.querySelector("#add-to-cart").addEventListener("click", () => {
    addToCart(productId, quantity);
    quantity = 1;
    quantityInput.value = quantity;
  });

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

  const reviewsContainer = document.getElementById("reviews-container");

  // Function to fetch and display reviews
  const fetchReviews = async (limit = 4) => {
    try {
      showSpinner();
      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCT}/${productId}/review?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        if (result.reviews.length > 0) {
          displayReviews(result.reviews);
        } else {
          reviewsContainer.innerHTML = `
        <div class="d-flex review-box border-top mt-4 pt-4">
          <p>No Reviews Found.</p>
        </div>`;
        }
      } else {
        showToast(result.error, "danger");
      }
    } catch (error) {
      showToast(`Error fetching reviews: ${error.message}`, "danger");
    } finally {
      hideSpinner();
    }
  };

  // Function to display reviews
  const displayReviews = (reviews) => {
    reviewsContainer.innerHTML = ""; // Clear existing reviews
    reviews.forEach((review) => {
      const fullName =
        review.user.firstName && review.user.lastName
          ? `${review.user.firstName} ${review.user.lastName}`
          : review.user.firstName || review.user.lastName || "N/A";
      const imgurl =
        review.user.profilePhoto?.url || "../../assets/img/avatar.png";

      const reviewBox = document.createElement("div");
      reviewBox.className = "d-flex review-box border-top mt-4 pt-4";
      reviewBox.innerHTML = `
      <div>
        <div class="review-image">
          <img
            class="img-fluid"
            src="${imgurl}"
            alt="${fullName}"
          />
        </div>
      </div>
      <div class="col ps-3">
        <h6>${fullName}</h6>
        <div class="rating-star small">
          ${renderStars(review.rating)}
          <span>
            ${new Date(review.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <p class="m-0 pt-3">${review.comment}</p>
      </div>
    `;
      reviewsContainer.appendChild(reviewBox);
    });
  };

  fetchReviews();

  const viewAllReviewsBtn = document.getElementById("view-all-reviews");
  const hideReviewsBtn = document.getElementById("hide-all-reviews");

  // Event listener to fetch all reviews and toggle buttons
  viewAllReviewsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    fetchReviews(null);
    viewAllReviewsBtn.style.display = "none";
    hideReviewsBtn.style.display = "inline";
  });

  hideReviewsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    fetchReviews(4);
    hideReviewsBtn.style.display = "none";
    viewAllReviewsBtn.style.display = "inline";
  });

  const stars = document.querySelectorAll("#starRating i");
  const ratingValue = document.getElementById("ratingValue");

  function resetStars() {
    stars.forEach((star) => {
      star.classList.remove("bi-star-fill");
      star.classList.add("bi-star");
    });
    ratingValue.value = ""; // Reset the hidden rating value
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-rating");
      ratingValue.value = rating; // Set hidden input value

      // Clear previous stars
      stars.forEach((s) => {
        s.classList.remove("bi-star-fill");
        s.classList.add("bi-star");
      });

      // Fill stars up to the clicked star
      for (let i = 0; i < rating; i++) {
        stars[i].classList.remove("bi-star");
        stars[i].classList.add("bi-star-fill");
      }
    });
  });

  const reviewForm = document.getElementById("review-form");

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!checkUserAuth()) {
      showToast("Please Login First....!", "warning");
      return;
    }

    const rating = document.getElementById("ratingValue").value;
    const comment = document.getElementById("review-body").value;

    if (!rating || comment.trim() === "") {
      alert("Please fill all fields.");
      return;
    }

    try {
      showSpinner();
      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCT}/${productId}/review/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
          body: JSON.stringify({ rating, comment }),
        }
      );

      const result = await response.json();
      if (result.success) {
        showToast(result.message, "success");
        fetchReviews();
        fetchProductDetails();

        reviewForm.reset();
        resetStars();
      } else {
        showToast(result.message + result.error, "warning");
      }
    } catch (error) {
      showToast(`Error submitting review: ${error.message}`, "danger");
    } finally {
      hideSpinner();
    }
  });

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCT}/${productId}/related`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      const result = await response.json();

      const productContainer = document.querySelector("#related-swiper");
      productContainer.innerHTML = result.relatedProducts
        .map(
          (product) => `
            <div class="swiper-slide">
              <div class="product-card-2 overflow-hidden">
                <div class="product-card-image">
                  ${
                    product.highlights.sale
                      ? `<div class="badge-ribbon"><span class="badge bg-warning">Sale</span></div>`
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
                      <a  class="btn btn-primary" onclick="addToCart('${
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
                    ${renderSizeOptions(product.sizes, product._id)}
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
      console.error("Error fetching related products:", error);
      showToast(error.message || "Failed to load related products", "danger");
    }
  };

  // Swiper initialization
  function initializeSwiper() {
    new Swiper(".related-swiper-container",{
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

  // Call the fetch function
  fetchRelatedProducts();
});
