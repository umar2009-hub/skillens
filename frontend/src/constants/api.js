export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  }
};
