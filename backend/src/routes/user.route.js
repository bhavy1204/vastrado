import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    oAuthCallback,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyUserOnly } from "../middleware/auth.middleware.js";
import {
    validateUserRegister,
    validateUserLogin,
    validateUserUpdateProfile,
    validateUserAddress,
} from "../middleware/validators/user.validator.js";

const router = express.Router();

// public

router.post("/register", validateUserRegister, registerUser);
router.post("/login", validateUserLogin, loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);
router.post("/google", oAuthCallback);

// protected

router.use(verifyJWT, verifyUserOnly);

// profile 

router.get("/profile", getUserProfile);
router.patch("/profile", validateUserUpdateProfile, updateUserProfile);
router.patch("/change-password", changePassword);

// addresses

router.post("/addresses", validateUserAddress, addAddress);
router.patch("/addresses/:addressId", validateUserAddress, updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

// wishlist

router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);


export default router;

