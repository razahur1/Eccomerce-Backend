import ENDPOINTS from "../../assets/js/config.js";
import {
  checkAdminAuth,
  loadUserInfo,
  logoutHandler,
  getToken,
} from "../../assets/js/auth.js";
import {
  showToast,
  showSpinner,
  hideSpinner,
  showConfirm,
  updatePagination,
  getPageFromURL,
  updatePageInURL,
  formatPrice,
} from "../../assets/js/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAuth()) {
    window.location.href = "../login/unauthorized.html";
  }

  loadUserInfo();
  logoutHandler();

  const token = getToken();
  const categoriesWrapper = document.getElementById("categories-wrapper");
  const categoriesSelect = document.getElementById("categories");

  // Fetch categories and populate the select element
  async function fetchCategories() {
    showSpinner();
    try {
      const response = await fetch(ENDPOINTS.GET_CATEGORIES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) populateCategories(result.categories);
      else showToast("Failed to fetch categories", "danger");
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("An error occurred while fetching categories", "danger");
    } finally {
      hideSpinner();
    }
  }

  // Populate the categories select element
  function populateCategories(categories) {
    categories.forEach(({ _id, name }) => {
      const option = new Option(name, _id);
      categoriesSelect.add(option);
    });
  }

  // Add another category selection
  window.addCategorySelect = function () {
    const categoryDiv = document.createElement("div");
    categoryDiv.className =
      "category-select-wrapper mb-2 d-flex align-items-center";

    const newSelect = document.createElement("select");
    newSelect.className = "form-select me-2";
    newSelect.required = true;

    // Generate the options, hiding those already selected
    const optionsHTML = Array.from(categoriesSelect.options)
      .slice(1) // Skip the placeholder option
      .map(
        (opt) =>
          `<option value="${opt.value}" ${
            isCategorySelected(opt.value) ? "style='display:none;'" : ""
          }>${opt.textContent}</option>`
      )
      .join("");

    newSelect.innerHTML =
      `<option disabled selected>Select Category</option>` + optionsHTML;

    // Event listener to update options in all selects when a category is changed
    newSelect.addEventListener("change", updateAllCategoryOptions);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-danger btn-sm";
    removeButton.textContent = "Remove";
    removeButton.onclick = () => {
      categoriesWrapper.removeChild(categoryDiv);
      updateAllCategoryOptions(); // Re-enable options in other selects after removal
    };

    categoryDiv.append(newSelect, removeButton);
    categoriesWrapper.appendChild(categoryDiv);
  };

  // Function to check if a category is already selected
  function isCategorySelected(value) {
    return Array.from(categoriesWrapper.querySelectorAll("select")).some(
      (select) => select.value === value
    );
  }

  // Function to update the options in all category selects and hide selected options
  function updateAllCategoryOptions() {
    const selectedValues = Array.from(
      categoriesWrapper.querySelectorAll("select")
    ).map((select) => select.value);

    Array.from(categoriesWrapper.querySelectorAll("select")).forEach(
      (select) => {
        Array.from(select.options).forEach((option) => {
          if (
            selectedValues.includes(option.value) &&
            option.value !== select.value
          ) {
            option.style.display = "none"; // Hide already selected categories
          } else {
            option.style.display = ""; // Show available categories
          }
        });
      }
    );
  }

  // Variables to track the current page and total pages
  let currentPage = getPageFromURL();

  window.fetchProducts = async function (page = currentPage, limit = 3) {
    currentPage = page;
    try {
      showSpinner();

      const searchQuery = document.getElementById("productSearchInput").value;

      const queryParams = new URLSearchParams({
        search: searchQuery,
        page: page,
        limit: limit,
      });

      const response = await fetch(
        `${ENDPOINTS.GET_PRODUCTS}?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
            "Cache-Control": "no-cache",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update product table body
        productTableBody.innerHTML = result.products
          .map((product) => {
            const sizes = product.sizes;
            let stockStatus = "success";

            const outOfStockSizes = sizes.filter((size) => size.stock === 0);

            if (outOfStockSizes.length === sizes.length) {
              stockStatus = "danger";
            } else if (outOfStockSizes.length > 0) {
              stockStatus = "warning";
            }

            return `
            <tr class="text-center align-middle">
              <td>
                <span class="badge bg-${stockStatus} rounded-circle" style="width: 13px; height: 13px; display: inline-block; margin-right:20px"></span>
                ${product.code}
              </td>
              <td><img src="${
                product.images[0].url
              }" alt="Product Image" width="100" /></td>
              <td>${product.name}</td>
              <td>${formatPrice(product.price)}</td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct('${
                  product._id
                }', ${currentPage})">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${
                  product._id
                }', ${currentPage})">
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button
                  class="btn btn-sm btn-info"
                  data-bs-toggle="modal"
                  data-bs-target="#viewProductModal"
                  onclick="viewProduct('${product._id}')">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          `;
          })
          .join("");

        // Update pagination controls
        updatePagination(
          result.totalProducts,
          currentPage,
          limit,
          (newPage) => {
            updatePageInURL(newPage); // Update URL when changing pages
            fetchProducts(newPage, limit);
          }
        );

        // Redirect to the last page if current page exceeds total pages
        if (page > result.totalPages) {
          window.location.href = `${window.location.pathname}?page=${result.totalPages}`;
          return;
        }
      } else {
        showToast("Failed to fetch products", "danger");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("An error occurred while fetching products", "danger");
    } finally {
      hideSpinner();
    }
  };

  fetchCategories();
  fetchProducts();

  const quill = new Quill("#quill-editor", {
    theme: "snow",
    placeholder: "Enter detailed description...",
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        ["image", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
    },
  });

  quill.on("text-change", function () {
    const description = quill.root.innerHTML;
    document.getElementById("detail-description").value = description;
  });

  const productForm = document.getElementById("addEditProductForm");
  const productTableBody = document.querySelector("#productTableBody");
  const formHeading = document.getElementById("ProductformTitle");

  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("productId").value;

    const productData = new FormData();

    // Append all fields
    const productName = document.getElementById("product-name").value.trim();
    const introDescription = document
      .getElementById("intro-description")
      .value.trim();
    const detailDescription = document
      .getElementById("detail-description")
      .value.trim();
    const price = parseInt(document.getElementById("price").value.trim());
    const gender = document.getElementById("gender").value;
    const tagsInput = document.getElementById("tags").value.trim();

    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const selectedCategories = Array.from(
      document.querySelectorAll(".category-select-wrapper select")
    )
      .map((select) => select.value)
      .filter((value) => value && value !== "Select Category");

    if (
      !productName ||
      !introDescription ||
      !detailDescription ||
      !price ||
      selectedCategories.length === 0 ||
      !gender ||
      !tags
    ) {
      showToast("All required fields must be filled", "danger");
      return;
    }

    // Add fields to FormData
    productData.append("name", productName);
    productData.append("intro", introDescription);
    productData.append("description", detailDescription);
    productData.append("price", price);
    productData.append("category", JSON.stringify(selectedCategories));
    productData.append("gender", gender);

    // Append each tag separately
    tagsArray.forEach((tag) => {
      productData.append("tags[]", tag);
    });

    productData.append(
      "sizes",
      JSON.stringify([
        {
          size: "S",
          stock: parseInt(document.getElementById("stock-S").value.trim()) || 0,
        },
        {
          size: "M",
          stock: parseInt(document.getElementById("stock-M").value.trim()) || 0,
        },
        {
          size: "L",
          stock: parseInt(document.getElementById("stock-L").value.trim()) || 0,
        },
        {
          size: "XL",
          stock:
            parseInt(document.getElementById("stock-XL").value.trim()) || 0,
        },
      ])
    );

    // Highlights
    productData.append(
      "justIn",
      document.getElementById("highlight-justIn").checked
    );
    productData.append(
      "popular",
      document.getElementById("highlight-popular").checked
    );
    productData.append(
      "valued",
      document.getElementById("highlight-valued").checked
    );
    productData.append(
      "adored",
      document.getElementById("highlight-adored").checked
    );
    productData.append(
      "trendy",
      document.getElementById("highlight-trendy").checked
    );
    productData.append(
      "sale",
      document.getElementById("highlight-sale").checked
    );

    const onSale = document.getElementById("highlight-sale").checked;
    if (onSale) {
      const salePriceValue = document.getElementById("sale-price").value.trim();
      const saleEndDateValue = document
        .getElementById("sale-duration")
        .value.trim();

      if (
        !salePriceValue ||
        isNaN(parseInt(salePriceValue)) ||
        !saleEndDateValue
      ) {
        showToast(
          "Please provide Sale Price and Sale Duration when the product is on sale",
          "danger"
        );
        return;
      }

      productData.append("salePrice", parseInt(salePriceValue));
      const saleEndDate = new Date(saleEndDateValue);
      productData.append("saleEndDate", saleEndDate.toISOString());
    }

    // Append images
    const images = document.getElementById("product-images").files;
    for (let i = 0; i < images.length; i++) {
      productData.append("files", images[i]);
    }

    showSpinner();

    try {
      const url = productId
        ? `${ENDPOINTS.UPDATE_PRODUCT}/${productId}`
        : ENDPOINTS.ADD_PRODUCT;
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: token,
        },
        credentials: "include",
        body: productData,
      });
      const result = await response.json();

      if (result.success) {
        showToast(
          productId
            ? "Product updated successfully"
            : "Product added successfully",
          "success"
        );

        resetForm();
        fetchProducts(currentPage);
        hideForm();
      } else {
        console.error(result);
        showToast(
          "Failed to save product: " + (result.message || "Unknown error"),
          "danger"
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("An error occurred while saving product", "danger");
    } finally {
      hideSpinner();
    }
  });

  window.editProduct = async (id, page) => {
    currentPage = page;
    showSpinner();
    try {
      const response = await fetch(`${ENDPOINTS.GET_PRODUCT}/${id}`, {
        method: "GET",
        headers: { Authorization: token, "Cache-Control": "no-cache" },
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        const product = result.product;
        const getElement = (id) =>
          document.getElementById(id) ||
          console.error(`Element "${id}" not found.`);
        const {
          _id,
          name,
          intro,
          description,
          price,
          gender = "Men",
          salePrice,
          saleEndDate,
          tags = [],
          category = [],
          sizes = [],
          highlights = {},
          images,
        } = product;

        // Populate form fields
        getElement("productId").value = _id || "";
        getElement("product-name").value = name || "";
        getElement("intro-description").value = intro || "";
        getElement("detail-description").value = description || "";
        quill.root.innerHTML = description;
        getElement("price").value = price || "";
        getElement("gender").value = gender;
        getElement("sale-price").value = salePrice || "";
        getElement("sale-duration").value = saleEndDate
          ? new Date(saleEndDate).toISOString().slice(0, 16)
          : "";
        getElement("tags").value = tags.join(", ") || "";

        // Handle categories
        const categoriesWrapper = getElement("categories-wrapper");
        categoriesWrapper.innerHTML = category.length
          ? category
              .map(({ _id: categoryId }) => createCategoryElement(categoryId))
              .join("")
          : createDefaultCategoryElement();

        // Populate sizes
        sizes.forEach(({ size, stock }) => {
          const stockInput = getElement(`stock-${size}`);
          if (stockInput) stockInput.value = stock || 0;
        });

        // Populate highlights
        Object.keys(highlights).forEach((key) => {
          const highlightCheckbox = getElement(`highlight-${key}`);
          if (highlightCheckbox)
            highlightCheckbox.checked = highlights[key] || false;
        });

        // Render images and show the form
        renderImages(images);
        formHeading.innerHTML = "Edit Product";
        showForm();
      } else {
        showToast("Failed to fetch product details", "danger");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showToast("An error occurred while fetching product details", "danger");
    } finally {
      hideSpinner();
    }
  };

  // Helper function to create a category select element
  const createCategoryElement = (categoryId) => `
    <div class="category-select-wrapper mb-2 d-flex align-items-center">
      <select class="form-select me-2" required>
        <option disabled>Select Category</option>
        ${Array.from(categoriesSelect.options)
          .map(
            (opt) =>
              `<option value="${opt.value}" ${
                opt.value === categoryId ? "selected" : ""
              }>${opt.textContent}</option>`
          )
          .join("")}
      </select>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Remove</button>
    </div>
  `;

  // Helper function to create a default category select element when no categories exist
  const createDefaultCategoryElement = () => `
    <div class="category-select-wrapper mb-2 d-flex align-items-center">
      <select class="form-select me-2" required>
        <option disabled selected>Select Category</option>
        ${Array.from(categoriesSelect.options)
          .map(
            (opt) => `<option value="${opt.value}">${opt.textContent}</option>`
          )
          .join("")}
      </select>
    </div>
  `;

  // Render existing images for editing
  function renderImages(images) {
    const imagePreviewContainer = document.getElementById(
      "image-preview-container"
    );
    imagePreviewContainer.innerHTML = "";

    const imageSize = 100;

    if (Array.isArray(images) && images.length) {
      images.forEach((image) => {
        const imgDiv = document.createElement("div");
        imgDiv.className = "position-relative d-inline-block me-2 mb-2";

        imgDiv.innerHTML = `
          <img src="${image.url}" alt="Product Image" class="img-thumbnail" style="width: ${imageSize}px; height: ${imageSize}px; object-fit: cover;" />
        <button type="button" class="btn btn-danger btn-sm position-absolute" style="top: 3px; right: 3px; padding: 2px 5px; border-radius: 50%; font-size: 0.7rem;" onclick="removeImage('${image.public_id}')">
          &#10005; <!-- You can replace this with an icon if you prefer -->
        </button>
      `;

        imagePreviewContainer.appendChild(imgDiv);
      });
    } else {
      console.warn("No images found for this product.");
    }
  }

  // Remove image
  window.removeImage = async (imageId) => {
    const userConfirmed = await showConfirm(
      "Are you sure you want to remove this image?"
    );
    if (userConfirmed) {
      showSpinner();
      try {
        const response = await fetch(
          `${ENDPOINTS.GET_PRODUCT}/${productId.value}/delete-image/${imageId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            credentials: "include",
          }
        );

        const result = await response.json();

        if (result.success) {
          showToast("Image removed successfully", "success");
          renderImages(result.product.images);
        } else {
          showToast(`Failed to remove image: ${result.message}`, "danger");
        }
      } catch (error) {
        console.error("Error removing image:", error);
        showToast("An error occurred while removing the image", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  // Delete product
  window.deleteProduct = async function (id, page) {
    currentPage = page;
    const userConfirmed = await showConfirm(
      "Are you sure you want to delete this product?"
    );
    if (userConfirmed) {
      showSpinner();

      try {
        const response = await fetch(`${ENDPOINTS.DELETE_PRODUCT}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          fetchProducts(currentPage);
          showToast("Product deleted successfully", "success");
        } else {
          showToast("Failed to delete product", "danger");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showToast("An error occurred while deleting product", "danger");
      } finally {
        hideSpinner();
      }
    }
  };

  window.viewProduct = async function (id) {
    try {
      const response = await fetch(`${ENDPOINTS.GET_PRODUCT}/${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
        credentials: "include",
      });

      const { product } = await response.json();

      document.getElementById("viewProductName").innerText =
        product.name || "N/A";
      document.getElementById("viewProductCode").innerText =
        product.code || "N/A";
      document.getElementById("viewProductIntro").innerText =
        product.intro || "N/A";
      document.getElementById("viewProductDescription").innerHTML =
        product.description || "N/A";
      document.getElementById("viewProductPrice").innerText = product.price
        ? product.price.toFixed(2)
        : "N/A";
      document.getElementById("viewProductSalePrice").innerText =
        product.salePrice ? product.salePrice.toFixed(2) : "N/A";
      document.getElementById("viewProductSaleDuration").innerText =
        product.saleEndDate
          ? new Date(product.saleEndDate).toLocaleString()
          : "N/A";
      document.getElementById("viewProductGender").innerText =
        product.gender || "N/A";

      document.getElementById("viewProductCategories").innerText =
        product.category && product.category.length > 0
          ? product.category.map((cat) => cat.name).join(", ")
          : "N/A";

      document.getElementById("viewProductTags").innerText =
        product.tags && product.tags.length > 0
          ? product.tags.join(", ")
          : "N/A";

      document.getElementById("viewProductStock").innerText =
        product.sizes && product.sizes.length > 0
          ? product.sizes
              .map((size) => `${size.size.toUpperCase()}: ${size.stock}`)
              .join(", ")
          : "N/A";

      const highlights = [];
      if (product.highlights.justIn) highlights.push("Just In");
      if (product.highlights.popular) highlights.push("Popular");
      if (product.highlights.valued) highlights.push("Valued");
      if (product.highlights.adored) highlights.push("Adored");
      if (product.highlights.trendy) highlights.push("Trendy");
      if (product.highlights.sale) highlights.push("Sale");
      document.getElementById("viewProductHighlightsList").innerText =
        highlights.length > 0 ? highlights.join(", ") : "N/A";

      // Populate Images
      const imagesContainer = document.getElementById(
        "viewProductImagesContainer"
      );
      imagesContainer.innerHTML = "";
      if (product.images && product.images.length > 0) {
        product.images.forEach((image) => {
          const img = document.createElement("img");
          img.src = image.url;
          img.alt = "Product Image";
          img.className = "img-thumbnail";
          img.style.width = "120px";
          img.style.height = "120px";
          imagesContainer.appendChild(img);
        });
      } else {
        imagesContainer.innerHTML = "<p>No images available</p>";
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showToast("Failed to fetch product details. Please try again.", "danger");
    }
  };

  window.hideForm = function () {
    document.getElementById("productTable").classList.remove("d-none");
    document.getElementById("productForm").classList.add("d-none");
    fetchProducts(currentPage);
  };

  window.showForm = function () {
    document.getElementById("productForm").classList.remove("d-none");
    document.getElementById("productTable").classList.add("d-none");
  };

  window.addProduct = function () {
    resetForm();
    formHeading.innerHTML = "Add Product";
    quill.root.innerHTML = "";
    showForm();
  };

  function resetForm() {
    productForm.reset();

    const categoriesWrapper = document.getElementById("categories-wrapper");
    categoriesWrapper.innerHTML = "";

    const categoryDiv = document.createElement("div");
    categoryDiv.className =
      "category-select-wrapper mb-2 d-flex align-items-center";

    const selectElement = document.createElement("select");
    selectElement.className = "form-select me-2";
    selectElement.required = true;
    selectElement.innerHTML =
      `<option disabled selected>Select Category</option>` +
      Array.from(categoriesSelect.options)
        .slice(1)
        .map(
          (opt) => `<option value="${opt.value}">${opt.textContent}</option>`
        )
        .join("");

    categoryDiv.appendChild(selectElement);
    categoriesWrapper.appendChild(categoryDiv);

    const imagePreviewContainer = document.getElementById(
      "image-preview-container"
    );
    imagePreviewContainer.innerHTML = "";
  }

  let searchTimeout;

  document
    .getElementById("productSearchInput")
    .addEventListener("input", () => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        fetchProducts(1);
      }, 500);
    });
});
