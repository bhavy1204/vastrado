import api from "../axios.js";

const BASE = "/v1/user";

const userService = {

  // public

  register: (data) =>
    api.post(`${BASE}/register`, data),


  login: async (data) => {
    const res = await api.post(`${BASE}/login`, data);
    localStorage.setItem("actorType", "user");
    localStorage.setItem("userRole", res.data.data.role ?? "user");
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

  // Called automatically by axiosInstance interceptor — not called manually
  refreshToken: () =>
    api.post(`${BASE}/refresh-token`),

  googleAuth: (data) =>
    api.post(`${BASE}/google`, data),                

  // protected

  logout: async () => {
    const res = await api.post(`${BASE}/logout`);
    localStorage.removeItem("actorType");
    localStorage.removeItem("userRole");
    return res;
  },

  getProfile: () =>
    api.get(`${BASE}/profile`),

  updateProfile: (data) =>
    api.patch(`${BASE}/profile`, data),

  changePassword: (data) =>
    api.patch(`${BASE}/change-password`, data),

  addAddress: (data) =>
    api.post(`${BASE}/addresses`, data),

  updateAddress: (addressId, data) =>
    api.patch(`${BASE}/addresses/${addressId}`, data),

  deleteAddress: (addressId) =>
    api.delete(`${BASE}/addresses/${addressId}`),

  setDefaultAddress: (addressId) =>
    api.patch(`${BASE}/addresses/${addressId}/default`),

  getWishlist: () =>
    api.get(`${BASE}/wishlist`),

  addToWishlist: (productId) =>
    api.post(`${BASE}/wishlist/${productId}`),

  removeFromWishlist: (productId) =>
    api.delete(`${BASE}/wishlist/${productId}`),
};

export default userService;
