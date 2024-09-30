// Sample API Endpoints
const API_BASE_URL = "https://yourapi.com"; // Replace with your API base URL

// Fetch Categories from API
function getCategories() {
  fetch(`${API_BASE_URL}/categories`)
    .then((response) => response.json())
    .then((categories) => {
      const categorySelect = document.getElementById("categories-wrapper");
      categorySelect.innerHTML = "";
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching categories:", error));
}

// Add New Category (Dynamically)
function addCategory() {
  const categorySelect = document.getElementById("categories-wrapper");
  const newCategory = document.createElement("select");
  newCategory.className = "form-select mb-2";
  newCategory.innerHTML = categorySelect.innerHTML; // Duplicate the categories dropdown
  document.getElementById("categories-wrapper").appendChild(newCategory);
}

// Add Product Functionality
function addProduct() {
  const productData = collectProductFormData();
  fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Product added successfully!");
      resetProductForm();
      showTable();
      getProducts(); // Reload the product list
    })
    .catch((error) => console.error("Error adding product:", error));
}

// Update Product Functionality (without image)
function updateProduct(productId) {
  const productData = collectProductFormData();
  fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Product updated successfully!");
      resetProductForm();
      showTable();
      getProducts(); // Reload the product list
    })
    .catch((error) => console.error("Error updating product:", error));
}

// Collect Product Form Data
function collectProductFormData() {
  const productData = {
    name: document.getElementById("product-name").value,
    introDescription: document.getElementById("intro-description").value,
    detailDescription: document.getElementById("detail-description").value,
    categories: Array.from(
      document.querySelectorAll("#categories-wrapper select")
    ).map((select) => select.value),
    tags: document.getElementById("tags").value.split(","),
    price: parseFloat(document.getElementById("price").value),
    gender: document.getElementById("gender").value,
    highlights: {
      justIn: document.getElementById("highlight-justIn").checked,
      popular: document.getElementById("highlight-popular").checked,
      valued: document.getElementById("highlight-valued").checked,
      adored: document.getElementById("highlight-adored").checked,
      trendy: document.getElementById("highlight-trendy").checked,
      onSale: document.getElementById("highlight-sale").checked,
    },
    salePrice: parseFloat(document.getElementById("sale-price").value) || null,
    saleDuration: document.getElementById("sale-duration").value || null,
    stock: {
      S: parseInt(document.getElementById("stock-s").value),
      M: parseInt(document.getElementById("stock-m").value),
      L: parseInt(document.getElementById("stock-l").value),
      XL: parseInt(document.getElementById("stock-xl").value),
    },
  };
  return productData;
}

// Add and Remove Product Images (on Edit)
function addProductImage(productId, imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  fetch(`${API_BASE_URL}/products/${productId}/images`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Image added successfully!");
      getProductImages(productId); // Reload the image previews
    })
    .catch((error) => console.error("Error adding image:", error));
}

function removeProductImage(productId, imageId) {
  fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Image removed successfully!");
      getProductImages(productId); // Reload the image previews
    })
    .catch((error) => console.error("Error removing image:", error));
}

// Get Product Images and Render Preview
function getProductImages(productId) {
  fetch(`${API_BASE_URL}/products/${productId}/images`)
    .then((response) => response.json())
    .then((images) => {
      const imagePreviewContainer = document.getElementById(
        "image-preview-container"
      );
      imagePreviewContainer.innerHTML = ""; // Clear previous images
      images.forEach((image) => {
        const imgElement = document.createElement("img");
        imgElement.src = image.url;
        imgElement.classList.add("img-thumbnail", "mb-2");
        imgElement.width = 100;

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => removeProductImage(productId, image.id);

        imagePreviewContainer.appendChild(imgElement);
        imagePreviewContainer.appendChild(removeBtn);
      });
    })
    .catch((error) => console.error("Error fetching images:", error));
}

// Get Products List
function getProducts() {
  fetch(`${API_BASE_URL}/products`)
    .then((response) => response.json())
    .then((products) => {
      const productTableBody = document.getElementById("productTableBody");
      productTableBody.innerHTML = ""; // Clear previous product rows
      products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.code}</td>
          <td><img src="${
            product.imageUrl
          }" alt="Product Image" width="50" /></td>
          <td>${product.name}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editProduct(${
              product.id
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${
              product.id
            })">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        productTableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error fetching products:", error));
}

// Search Products
function searchProducts(query) {
  fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((products) => {
      const productTableBody = document.getElementById("productTableBody");
      productTableBody.innerHTML = ""; // Clear previous product rows
      products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.code}</td>
          <td><img src="${
            product.imageUrl
          }" alt="Product Image" width="50" /></td>
          <td>${product.name}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editProduct(${
              product.id
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${
              product.id
            })">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        productTableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error searching products:", error));
}

// Hide and Show Table and Form
function hideTable() {
  document.getElementById("productTable").classList.add("d-none");
  document.getElementById("productForm").classList.remove("collapse");
}

function showTable() {
  document.getElementById("productTable").classList.remove("d-none");
  document.getElementById("productForm").classList.add("collapse");
}

// Reset Product Form
function resetProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("categories-wrapper").innerHTML = ""; // Clear all added category fields
  getCategories(); // Fetch categories again
}
