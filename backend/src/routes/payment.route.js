import express from "express";
import {
    createSubscription,
    verifyPayment,
    cancelSubscription,
} from "../controllers/payment.controller.js";
import { verifyJWT, verifySellerOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// WEBHOOK (public, no JWT) 
// Must be raw body — register before express.json() parses it
// In app.js, mount this route BEFORE the global express.json() middleware:
// app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }), paymentRoutes)

// router.post("/webhook", webhookHandler);

// protected, only seller can see

router.use(verifyJWT, verifySellerOnly);

router.post("/subscribe", createSubscription);
router.post("/verify", verifyPayment);
router.post("/cancel", cancelSubscription);

export default router;