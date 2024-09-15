const API_BASE_URL = "http://localhost:8080/api/v1";

const ENDPOINTS = {
  // ----------------AUTHENTICATION--------------------

  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_ACCOUNT: `${API_BASE_URL}/auth/verify-account`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,

  // ----------------USER--------------------

  GET_PROFILE: `${API_BASE_URL}/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/user/update-profile`,
};

export default ENDPOINTS;
