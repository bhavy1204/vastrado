import express from "express";
import {
    addReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews,
} from "../controllers/review.controller.js";
import { verifyJWT, verifyUserOnly } from "../middleware/auth.middleware.js";
import { validateObjectId, validatePaginationQuery } from "../middleware/validators/common.validator.js";

const router = express.Router();

// piublic

router.get("/product/:productId", validateObjectId, validatePaginationQuery, getProductReviews);

//protected

router.use(verifyJWT, verifyUserOnly);

router.get("/my", validatePaginationQuery, getUserReviews);
router.post("/product/:productId", validateObjectId, addReview);
router.patch("/:reviewId", validateObjectId, updateReview);
router.delete("/:reviewId", validateObjectId, deleteReview);

export default router;