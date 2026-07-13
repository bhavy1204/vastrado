import express from "express";
import {
    registerSeller,
    loginSeller,
    logoutSeller,
    refreshSellerAccessToken,
    verifySellerEmail,
    resendSellerOTP,
    forgotSellerPassword,
    resetSellerPassword,
    changeSellerPassword,
    getSellerPublicProfile,
    getSellerDashboard,
    updateSellerProfile,
    updateSellerAvatar,
    updateSellerBanner,
    updateShopLocation,
    getNearbySellers,
    getSellerSubscription,
} from "../controllers/seller.controller.js";
import { verifyJWT, verifySellerOnly } from "../middleware/auth.middleware.js";
import {
    validateSellerRegister,
    validateSellerLogin,
    validateSellerUpdateProfile,
} from "../middleware/validators/seller.validator.js";
import {
    uploadSellerImages,
    uploadSellerAvatar,
    uploadSellerBanner,
} from "../middleware/upload.middleware.js";
import { parseLocationField } from "../middleware/parseLocation.js";

const router = express.Router();

// public

router.post("/register", uploadSellerImages, parseLocationField ,validateSellerRegister, registerSeller);
router.post("/login", validateSellerLogin, loginSeller);
router.post("/verify-email", verifySellerEmail);
router.post("/resend-otp", resendSellerOTP);
router.post("/forgot-password", forgotSellerPassword);
router.post("/reset-password", resetSellerPassword);
router.post("/refresh-token", refreshSellerAccessToken);

// for customer(public)

router.get("/nearby", getNearbySellers);
router.get("/shop/:slug", getSellerPublicProfile);

// protected

router.use(verifyJWT, verifySellerOnly);

// seller account management

router.post("/logout", logoutSeller);
router.patch("/change-password", changeSellerPassword);

// seller dashboard & subscription
router.get("/dashboard", getSellerDashboard);
router.get("/subscription", getSellerSubscription);

// seller profile update
router.patch("/profile", validateSellerUpdateProfile, updateSellerProfile);
router.patch("/profile/avatar", uploadSellerAvatar, updateSellerAvatar);
router.patch("/profile/banner", uploadSellerBanner, updateSellerBanner);
router.patch("/profile/location", updateShopLocation);

export default router;