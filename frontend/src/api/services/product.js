import api from "../axios.js";

const BASE = "/v1/product";

const productService = {

    // public

    // params: { page, limit, productType, gender, color, brand, minPrice, maxPrice,  sort: "newest" | "price-asc" | "price-desc" | "top-rated" }
    getAll: (params) =>
        api.get(`${BASE}`, { params }),

    // params: { q, page, limit }, handles compound queries as well
    search: (params) =>
        api.get(`${BASE}/search`, { params }),

    // params: { page, limit, sort, ... }
    getByCategory: (productType, params) =>
        api.get(`${BASE}/category/${productType}`, { params }),

    // gender: "men" | "women" | "kids" | "unisex"
    getByGender: (gender, params) =>
        api.get(`${BASE}/gender/${gender}`, { params }),

    // Public-facing seller products (active only)
    getSellerProducts: (sellerId, params) =>
        api.get(`${BASE}/seller/${sellerId}`, { params }),

    getBySlug: (slug) =>
        api.get(`${BASE}/slug/${slug}`),

    getById: (productId) =>
        api.get(`${BASE}/${productId}`),

    // protected

    getMyProducts: (params) =>
        api.get(`${BASE}/my/products`, { params }),

    create: (formData) =>
        api.post(`${BASE}`, formData),

    update: (productId, data) =>
        api.patch(`${BASE}/${productId}`, data),

    toggleStatus: (productId) =>
        api.patch(`${BASE}/${productId}/toggle`),

    delete: (productId) =>
        api.delete(`${BASE}/${productId}`),
};

export default productService;