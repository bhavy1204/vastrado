import api from "../axios.js";

const BASE = "/v1/seller";

const sellerService = {

  // publix

  register: (formData) =>
    api.post(`${BASE}/register`, formData),


  login: async (data) => {
    const res = await api.post(`${BASE}/login`, data);
    localStorage.setItem("actorType", "seller");
    return res;
  },

  verifyEmail: (data) =>
    api.post(`${BASE}/verify-email`, data),

  resendOTP: (data) =>
    api.post(`${BASE}/resend-otp`, data),

  forgotPassword: (data) =>
    api.post(`${BASE}/forgot-password`, data),
  resetPassword: (data) =>
    api.post(`${BASE}/reset-password`, data),

  refreshToken: () =>
    api.post(`${BASE}/refresh-token`),


  getNearbySellers: (params) =>
    api.get(`${BASE}/nearby`, { params }),

  getSellerPublicProfile: (slug) =>
    api.get(`${BASE}/shop/${slug}`),

  // protected

  logout: async () => {
    const res = await api.post(`${BASE}/logout`);
    localStorage.removeItem("actorType");
    return res;
  },

  changePassword: (data) =>
    api.patch(`${BASE}/change-password`, data),

  getDashboard: () =>
    api.get(`${BASE}/dashboard`),

  getSubscription: () =>
    api.get(`${BASE}/subscription`),


  updateProfile: (data) =>
    api.patch(`${BASE}/profile`, data),


  updateAvatar: (formData) =>
    api.patch(`${BASE}/profile/avatar`, formData),

  updateBanner: (formData) =>
    api.patch(`${BASE}/profile/banner`, formData),

  updateShopLocation: (data) =>
    api.patch(`${BASE}/profile/location`, data),
};

export default sellerService;