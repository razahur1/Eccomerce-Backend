export const showError = (id, message) => {
  document.getElementById(id).textContent = message;
};

export const clearErrors = () => {
  const errorElements = document.querySelectorAll(".text-danger");
  errorElements.forEach((el) => (el.textContent = ""));
};

export const clearInputs = () => {
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });
};

export const startResendTimer = (buttonId, duration) => {
  const resendButton = document.getElementById(buttonId);
  let seconds = duration;

  resendButton.disabled = true;
  resendButton.textContent = `Resend OTP (${seconds}s)`;

  const resendTimeout = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(resendTimeout);
      resendButton.textContent = "Resend OTP";
      resendButton.disabled = false;
    } else {
      resendButton.textContent = `Resend OTP (${seconds}s)`;
    }
  }, 1000);
};

// export const showToast = (message, type = "primary") => {
//   const toastContainer = document.createElement("div");
//   toastContainer.className =
//     "toast-container position-fixed top-0 start-50 translate-middle-x p-3";
//   toastContainer.style.zIndex = 1050; // Ensure it appears above other content
//   toastContainer.innerHTML =
//     <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
//       <div class="d-flex">
//         <div class="toast-body">
//           ${message}
//         </div>
//         <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
//       </div>
//     </div>
//   ;

//   document.body.appendChild(toastContainer);

//   const toastElement = toastContainer.querySelector(".toast");
//   const toast = new bootstrap.Toast(toastElement);
//   toast.show();

//   toastElement.addEventListener("hidden.bs.toast", () => {
//     toastContainer.remove();
//   });
// };

export const showToast = (
  message,
  type = "primary",
  showLoginButton = false
) => {
  const toastContainer = document.createElement("div");
  toastContainer.className =
    "toast-container position-fixed top-0 start-50 translate-middle-x p-3";
  toastContainer.style.zIndex = 1050; // Ensure it appears above other content

  const loginButtonHTML = showLoginButton
    ? `<a href="../login/login.html" class="btn btn-dark ms-2" role="button">Login</a>`
    : "";

  toastContainer.innerHTML = `
    <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
          ${loginButtonHTML}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  document.body.appendChild(toastContainer);

  const toastElement = toastContainer.querySelector(".toast");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastContainer.remove();
  });
};

export const showConfirm = (message) => {
  return new Promise((resolve) => {
    const modalContainer = document.createElement("div");
    modalContainer.className = "modal fade";
    modalContainer.tabIndex = -1;
    modalContainer.setAttribute("aria-hidden", "true");

    modalContainer.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Action</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${message}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmButton">OK</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);
    const modal = new bootstrap.Modal(modalContainer);

    // Resolve promise based on user choice
    modalContainer.querySelector("#confirmButton").onclick = () => {
      modal.hide();
      resolve(true);
    };
    modalContainer.querySelector(".btn-secondary").onclick = () => {
      modal.hide();
      resolve(false);
    };

    modal.show();
    modalContainer.addEventListener("hidden.bs.modal", () =>
      modalContainer.remove()
    );
  });
};

export const showSpinner = () => {
  const spinnerContainer = document.createElement("div");
  spinnerContainer.className =
    "d-flex justify-content-center align-items-center position-fixed w-100 h-100 top-0 start-0 bg-light";
  spinnerContainer.setAttribute("id", "spinnerContainer");
  spinnerContainer.style.zIndex = "9999";

  const spinner = document.createElement("div");
  spinner.className = "spinner-border text-primary";
  spinner.setAttribute("role", "status");
  spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';

  spinnerContainer.appendChild(spinner);
  document.body.appendChild(spinnerContainer);
};

export const hideSpinner = () => {
  const spinnerContainer = document.getElementById("spinnerContainer");
  if (spinnerContainer) {
    spinnerContainer.remove(); // Remove the container from the DOM
  }
};

export const updatePagination = (
  totalItems,
  currentPage,
  limit,
  onPageChange
) => {
  const totalPages = Math.ceil(totalItems / limit);
  const paginationControls = document.getElementById("pagination-controls");
  const paginationInfo = document.getElementById("pagination-info");

  if (!paginationControls) return;

  // Update pagination info
  paginationInfo.innerHTML = `Showing: ${
    (currentPage - 1) * limit + 1
  } - ${Math.min(currentPage * limit, totalItems)} of ${totalItems}`;

  paginationControls.innerHTML = "";

  // Previous button
  if (currentPage > 1) {
    const prevLi = document.createElement("li");
    prevLi.className = "page-item";
    prevLi.innerHTML = `<a class="page-link" href="javascript:void(0);" aria-label="Previous"><span aria-hidden="true">«</span></a>`;
    prevLi.addEventListener("click", () => onPageChange(currentPage - 1));
    paginationControls.appendChild(prevLi);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
    li.addEventListener("click", () => onPageChange(i));
    paginationControls.appendChild(li);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextLi = document.createElement("li");
    nextLi.className = "page-item";
    nextLi.innerHTML = `<a class="page-link" href="javascript:void(0);" aria-label="Next"><span aria-hidden="true">»</span></a>`;
    nextLi.addEventListener("click", () => onPageChange(currentPage + 1));
    paginationControls.appendChild(nextLi);
  }
};

export const renderStars = (rating) => {
  let starsHTML = "";
  for (let i = 1; i <= 5; i++) {
    starsHTML += `<i class="bi bi-star${
      i <= rating ? "-fill active" : ""
    }"></i>`;
  }
  return starsHTML;
};

export const renderSizeOptions = (sizes, productId) => {
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
    <label class="radio-text-label" for="size_${size._id}">${size.size}</label>
    ${
      size.stock === 0
        ? `<span class="position-absolute top-50 start-0 w-100" style="height: 1px; background-color: rgb(247, 83, 83); transform: rotate(-45deg);"></span>`
        : ""
    }
  </div>`
    )
    .join("");
};

export const formatPrice = (price) => {
  return `Rs.${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const getPageFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("page") ? parseInt(params.get("page")) : 1;
};

export const updatePageInURL = (page) => {
  const params = new URLSearchParams(window.location.search);
  params.set("page", page);
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
};

export const generateStrongPassword = (length = 12) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialCharacters = "!@#$%^&*()_+[]{}|;:,.<>?";

  // Ensure the password contains at least one of each character type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password +=
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

  // Fill the rest of the password length with random characters from all categories
  const allCharacters = uppercase + lowercase + numbers + specialCharacters;
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters[randomIndex];
  }

  // Shuffle the password to ensure randomness
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
};

export const updatePasswordStrength = (password) => {
  let strength = 0;

  const passwordStrengthText = document.getElementById(
    "password-strength-text"
  );
  const passwordStrengthBar = document.querySelector(
    "#password-strength .progress-bar"
  );

  // Check criteria
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasLength = password.length >= 12;

  // Count the number of criteria met
  const criteriaMet = [
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
    hasLength,
  ].filter(Boolean).length;

  switch (criteriaMet) {
    case 1:
      strength = 10;
      break;
    case 2:
      strength = 30;
      break;
    case 3:
      strength = 50;
      break;
    case 4:
      strength = 70;
      break;
    case 5:
      strength = 100;
      break;
    default:
      strength = 0;
  }

  let strengthText;
  let width;
  let barColor;

  // Determine strength text, width, and color
  if (strength === 0) {
    strengthText = "Very Weak";
    width = "0%";
    barColor = "bg-danger"; // Red
  } else if (strength === 10) {
    strengthText = "Weak";
    width = "10%";
    barColor = "bg-danger"; // Red
  } else if (strength === 30) {
    strengthText = "Fair";
    width = "30%";
    barColor = "bg-warning"; // Yellow
  } else if (strength === 50) {
    strengthText = "Good";
    width = "50%";
    barColor = "bg-info"; // Blue
  } else if (strength === 70) {
    strengthText = "Strong";
    width = "70%";
    barColor = "bg-primary"; // Blue
  } else if (strength === 100) {
    strengthText = "Very Strong";
    width = "100%";
    barColor = "bg-success"; // Green
  }

  // Update strength text and width
  passwordStrengthText.innerText = strengthText;
  passwordStrengthBar.style.width = width;
  passwordStrengthBar.setAttribute("aria-valuenow", strength);
  passwordStrengthBar.className = "progress-bar " + barColor; // Change bar color
};

export const calculateSubtotal = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = item.product.highlights.sale
      ? item.product.salePrice
      : item.product.price;
    return total + itemPrice * item.quantity;
  }, 0);
};

export const calculateTax = (subtotal, taxRate = 0.1) => {
  return subtotal * taxRate;
};

export const calculateGrandTotal = (subtotal, tax, shipping = 0) => {
  return subtotal + tax + shipping;
};

