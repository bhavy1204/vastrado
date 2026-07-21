import api from "../axios.js";

const BASE = "/v1/admin";

const adminService = {
  // dashboard

  getDashboardStats: () =>
    api.get(`${BASE}/dashboard/stats`),

  // sellers

  getAllSellers: (params) =>
    api.get(`${BASE}/sellers`, { params }),

  getSellerById: (id) =>
    api.get(`${BASE}/sellers/${id}`),

  approveSeller: (id) =>
    api.patch(`${BASE}/sellers/${id}/approve`),

  suspendSeller: (id) =>
    api.patch(`${BASE}/sellers/${id}/suspend`),

  // users

  getAllUsers: (params) =>
    api.get(`${BASE}/users`, { params }),

  getUserById: (id) =>
    api.get(`${BASE}/users/${id}`),

  getUserByEmail: (email) =>
    api.get(`${BASE}/user/search`, {
      params: { email },
    }),

  deleteUser: (id) =>
    api.delete(`${BASE}/users/${id}`),

  //  cities

  createCity: (data) =>
    api.post(`${BASE}/cities`, data),

  getAllCities: () =>
    api.get(`${BASE}/cities`),

  getAllActiveCities: () =>
    api.get(`${BASE}/cities/active`),

  getCityById: (cityId) =>
    api.get(`${BASE}/cities/${cityId}`),

  toggleCityStatus: (cityId) =>
    api.patch(`${BASE}/cities/${cityId}/toggle-status`),

  deleteCity: (cityId) =>
    api.delete(`${BASE}/cities/${cityId}`),

  // staff

  createStaff: (data) =>
    api.post(`${BASE}/staff`, data),

  getAllStaff: () =>
    api.get(`${BASE}/staff`),

  getStaffById: (staffId) =>
    api.get(`${BASE}/staff/${staffId}`),

  getCityAdmin: (cityId) =>
    api.get(`${BASE}/cities/${cityId}/admin`),

  activateStaff: (staffId) =>
    api.patch(`${BASE}/staff/${staffId}/activate`),

  suspendStaff: (staffId) =>
    api.patch(`${BASE}/staff/${staffId}/suspend`),

  deleteStaff: (staffId) =>
    api.delete(`${BASE}/staff/${staffId}`),
};

export default adminService;
