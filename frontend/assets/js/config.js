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

  // ---------------- CATEGORY ----------------------

  GET_CATEGORIES: `${API_BASE_URL}/category/get-all`,
  ADD_CATEGORY: `${API_BASE_URL}/category/create`,
  UPDATE_CATEGORY: `${API_BASE_URL}/category/update`,
  DELETE_CATEGORY: `${API_BASE_URL}/category/delete`,

  //---------------PRODUCT---------------------

  GET_PRODUCT: `${API_BASE_URL}/product`,
  GET_PRODUCTS: `${API_BASE_URL}/product/get-all`,
  ADD_PRODUCT: `${API_BASE_URL}/product/create`,
  UPDATE_PRODUCT: `${API_BASE_URL}/product/update`,
  DELETE_PRODUCT: `${API_BASE_URL}/product/delete`,

  GET_WISHLIST: `${API_BASE_URL}/wishlist/get-all`,
  ADD_TO_WISHLIST: `${API_BASE_URL}/wishlist/add`,
  REMOVE_FROM_WISHLIST: `${API_BASE_URL}/wishlist/remove`,
  CHECK_WiSHLIST: `${API_BASE_URL}/wishlist/check`,

  ADD_TO_CART: `${API_BASE_URL}/cart/add`,
};

export default ENDPOINTS;
