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

export const showToast = (message, type = "primary") => {
  const toastContainer = document.createElement("div");
  toastContainer.className =
    "toast-container position-fixed bottom-0 end-0 p-3";
  toastContainer.innerHTML = `
    <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
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
