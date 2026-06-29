import api from "../axios.js";

const BASE = "/v1/admin";

const adminService = {

  getDashboardStats: () =>
    api.get(`${BASE}/dashboard/stats`),

  getAllSellers: (params) =>
    api.get(`${BASE}/sellers`, { params }),

  getSellerById: (id) =>
    api.get(`${BASE}/sellers/${id}`),

  approveSeller: (id) =>
    api.patch(`${BASE}/sellers/${id}/approve`),

  suspendSeller: (id) =>
    api.patch(`${BASE}/sellers/${id}/suspend`),

  getAllUsers: (params) =>
    api.get(`${BASE}/users`, { params }),

  getUserById: (id) =>
    api.get(`${BASE}/users/${id}`),

  getUserByEmail: (email) =>
    api.get(`${BASE}/user/search`, { params: { email } }),

  deleteUser: (id) =>
    api.delete(`${BASE}/users/${id}`),
};

export default adminService;