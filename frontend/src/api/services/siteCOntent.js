import api from "../axios.js";

const BASE = "/v1/siteContent";

const siteContentService = {

  // banner - public

  
  getAllBanners: () =>
    api.get(`${BASE}/banners`),

  // banner-seller

  createBannerRequest: (formData) =>
    api.post(`${BASE}/banners/request`, formData),

  getMyBanners: () =>
    api.get(`${BASE}/banners/my`),

 
  updateBanner: (bannerId, data) =>
    api.patch(`${BASE}/banners/${bannerId}`, data),

  // banner admin

  adminGetAllBanners: (params) =>
    api.get(`${BASE}/banners/admin`, { params }),

  adminCreateBanner: (formData) =>
    api.post(`${BASE}/banners/admin`, formData),

  adminUpdateBanner: (bannerId, data) =>
    api.patch(`${BASE}/banners/admin/${bannerId}`, data),

  approveBanner: (bannerId, data) =>
    api.patch(`${BASE}/banners/${bannerId}/approve`, data),

  rejectBanner: (bannerId) =>
    api.patch(`${BASE}/banners/${bannerId}/reject`),

  deleteBanner: (bannerId) =>
    api.delete(`${BASE}/banners/${bannerId}`),

  updateBannerOrder: (data) =>
    api.patch(`${BASE}/banners/admin/reorder`, data),

  // FAQ public

  getAllFAQs: () =>
    api.get(`${BASE}/faqs`),

  // FAQ admin

  createFAQ: (data) =>
    api.post(`${BASE}/faqs`, data),

  updateFAQ: (faqId, data) =>
    api.patch(`${BASE}/faqs/${faqId}`, data),

  deleteFAQ: (faqId) =>
    api.delete(`${BASE}/faqs/${faqId}`),
};

export default siteContentService;