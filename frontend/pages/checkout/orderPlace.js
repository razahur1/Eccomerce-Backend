document.addEventListener("DOMContentLoaded", async () => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const orderId = urlParams.get("orderId");

  const orderId = sessionStorage.getItem("orderId");
  if (!orderId) {
    window.location.href = "../shop/shop.html";
    return;
  }
  document.getElementById("order-id").textContent = orderId;
});
