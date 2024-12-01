const API_BASE_URL = "http://localhost:8080/api/v1";

const ENDPOINTS = {
  // ----------------AUTHENTICATION--------------------

  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_ACCOUNT: `${API_BASE_URL}/auth/verify-account`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,

  // ----------------USER--------------------

  GET_PROFILE: `${API_BASE_URL}/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/user/update-profile`,
  GET_USERS: `${API_BASE_URL}/user/get-all`,
  GET_USER_COUNT: `${API_BASE_URL}/user/count-all`,
  GET_OVERVIEW: `${API_BASE_URL}/user/overview`,

  //----------------ADDRESS----------------------

  GET_ADDRESS: `${API_BASE_URL}/address`,
  GET_ADDRESSES: `${API_BASE_URL}/address/get-all`,
  ADD_ADDRESS: `${API_BASE_URL}/address/create`,
  UPDATE_ADDRESS: `${API_BASE_URL}/address/update`,
  DELETE_ADDRESS: `${API_BASE_URL}/address/delete`,

  //-----------------PAYMENT-----------------------

  GET_PAYMENT: `${API_BASE_URL}/payment`,
  GET_PAYMENTS: `${API_BASE_URL}/payment/get-all`,
  ADD_PAYMENT: `${API_BASE_URL}/payment/add`,
  DELETE_PAYMENT: `${API_BASE_URL}/payment/delete`,

  // ---------------- CATEGORY ----------------------

  GET_CATEGORIES: `${API_BASE_URL}/category/get-all`,
  ADD_CATEGORY: `${API_BASE_URL}/category/create`,
  UPDATE_CATEGORY: `${API_BASE_URL}/category/update`,
  DELETE_CATEGORY: `${API_BASE_URL}/category/delete`,

  //---------------PRODUCT---------------------

  GET_PRODUCT: `${API_BASE_URL}/product`,
  GET_PRODUCTS: `${API_BASE_URL}/product/get-all`,
  GET_NEW_ARRIVALS: `${API_BASE_URL}/product/new-arrivals`,
  GET_BEST_SELLERS: `${API_BASE_URL}/product/best-sellers`,
  GET_OUT_OF_STOCK: `${API_BASE_URL}/product/out-of-stock`,
  ADD_PRODUCT: `${API_BASE_URL}/product/create`,
  UPDATE_PRODUCT: `${API_BASE_URL}/product/update`,
  DELETE_PRODUCT: `${API_BASE_URL}/product/delete`,

  //---------------WISHLIST---------------------

  GET_WISHLIST: `${API_BASE_URL}/wishlist/get-all`,
  ADD_TO_WISHLIST: `${API_BASE_URL}/wishlist/add`,
  REMOVE_FROM_WISHLIST: `${API_BASE_URL}/wishlist/remove`,
  CHECK_WiSHLIST: `${API_BASE_URL}/wishlist/check`,

  //------------------CART---------------------

  ADD_TO_CART: `${API_BASE_URL}/cart/add`,
  GET_CART: `${API_BASE_URL}/cart/get`,
  REMOVE_FROM_CART: `${API_BASE_URL}/cart/remove`,
  UPDATE_CART: `${API_BASE_URL}/cart/update`,
  UPDATE_ALL_CART: `${API_BASE_URL}/cart/update-all`,

  //------------------ORDER---------------------

  CREATE_ORDER: `${API_BASE_URL}/order/create`,
  GET_ORDER: `${API_BASE_URL}/order`,
  GET_ALL_ORDER: `${API_BASE_URL}/order/get-all`,
  GET_PENDING_ORDER: `${API_BASE_URL}/order/get-pending`,
  GET_MY_ORDER: `${API_BASE_URL}/order/my-orders`,
  UPDATE_ORDER: `${API_BASE_URL}/order/update`,
  DELETE_ORDER: `${API_BASE_URL}/order/delete`,
};

export default ENDPOINTS;
