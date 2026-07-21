import api from "../axios.js";

const BASE = "/v1/cityAdmin";

const cityAdminService = {
    // sellers

    getCitySellers: (params) =>
        api.get(`${BASE}/sellers`, { params }),

    getCitySellerByEmail: (email) =>
        api.get(`${BASE}/seller/search`, {
            params: { email },
        }),

    approveSeller: (sellerId) =>
        api.patch(`${BASE}/sellers/${sellerId}/approve`),

    suspendSeller: (sellerId) =>
        api.patch(`${BASE}/sellers/${sellerId}/suspend`),

    // staff

    getCityStaff: () =>
        api.get(`${BASE}/staff`),
};

export default cityAdminService;
