import api from "../axios.js";

const BASE = "/v1/review";

const reviewService = {

    //public

    // params: { page, limit }
    getProductReviews: (productId, params) =>
        api.get(`${BASE}/product/${productId}`, { params }),

    // protected

    // All reviews written by the logged-in user (populated with product info), params: { page, limit }
    getMyReviews: (params) =>
        api.get(`${BASE}/my`, { params }),

    // data: { rating, comment }, Backend enforces one review per user per product (compound unique index)
    addReview: (productId, data) =>
        api.post(`${BASE}/product/${productId}`, data),

    // data: { rating?, comment? }
    updateReview: (reviewId, data) =>
        api.patch(`${BASE}/${reviewId}`, data),

    // User can delete their own review; admin can delete any review.
    deleteReview: (reviewId) =>
        api.delete(`${BASE}/${reviewId}`),
};

export default reviewService;