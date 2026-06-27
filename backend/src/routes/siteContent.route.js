import express from "express";
import {
    createBannerRequest,
    getMyBanners,
    updateBanner,
    getAllBanners,
    adminCreateBanner,
    adminUpdateBanner,
    adminGetAllBanners,
    approveBanner,
    rejectBanner,
    deleteBanner,
    updateBannerOrder,
    getAllFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
} from "../controllers/siteContent.controller.js";
import { verifyJWT, verifySellerOnly } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { uploadSellerBanner } from "../middleware/upload.middleware.js";

const router = express.Router();

// hero Banners
router.get("/banners", getAllBanners);

// seller side

router.post("/banners/request", verifyJWT, verifySellerOnly, uploadSellerBanner, createBannerRequest);
router.get("/banners/my", verifyJWT, verifySellerOnly, getMyBanners);
router.patch("/banners/:bannerId", verifyJWT, verifySellerOnly, updateBanner);

// admin side

router.get("/banners/admin", verifyJWT, verifyAdmin, adminGetAllBanners);
router.post("/banners/admin", verifyJWT, verifyAdmin, uploadSellerBanner, adminCreateBanner);
router.patch("/banners/admin/reorder", verifyJWT, verifyAdmin, updateBannerOrder);
router.patch("/banners/admin/:bannerId", verifyJWT, verifyAdmin, adminUpdateBanner);
router.patch("/banners/:bannerId/approve", verifyJWT, verifyAdmin, approveBanner);
router.patch("/banners/:bannerId/reject", verifyJWT, verifyAdmin, rejectBanner);
router.delete("/banners/:bannerId", verifyJWT, verifyAdmin, deleteBanner);



// FAQ
// public

router.get("/faqs", getAllFAQs);

// admin side

router.post("/faqs", verifyJWT, verifyAdmin, createFAQ);
router.patch("/faqs/:faqId", verifyJWT, verifyAdmin, updateFAQ);
router.delete("/faqs/:faqId", verifyJWT, verifyAdmin, deleteFAQ);

export default router;