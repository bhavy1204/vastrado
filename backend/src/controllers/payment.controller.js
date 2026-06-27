import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Seller } from "../models/seller.model.js";
import { sendEmail } from "../utils/email.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_AMOUNT = 500; // INR
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// helpers

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

const generateInvoiceHTML = ({ seller, paymentId, amount, startDate, nextBillingDate }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 4px 0 0; opacity: 0.85; font-size: 14px; }
    .body { border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; }
    .amount-row { background: #f9fafb; border-radius: 6px; padding: 14px; margin: 16px 0; }
    .amount-label { font-size: 13px; color: #6b7280; }
    .amount-value { font-size: 22px; font-weight: 700; color: #4F46E5; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Payment Invoice</h1>
    <p>${process.env.APP_NAME ?? "Marketplace"}</p>
  </div>
  <div class="body">
    <p>Hi <strong>${seller.fullName}</strong>, your subscription payment was successful. <span class="badge">✓ Paid</span></p>
    <div class="amount-row">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">₹${amount}</div>
    </div>
    <div class="row">
      <span class="label">Shop Name</span>
      <span class="value">${seller.shopName}</span>
    </div>
    <div class="row">
      <span class="label">Payment ID</span>
      <span class="value">${paymentId}</span>
    </div>
    <div class="row">
      <span class="label">Subscription Start</span>
      <span class="value">${formatDate(startDate)}</span>
    </div>
    <div class="row">
      <span class="label">Next Billing Date</span>
      <span class="value">${formatDate(nextBillingDate)}</span>
    </div>
    <div class="row">
      <span class="label">Plan</span>
      <span class="value">Monthly — ₹500/month</span>
    </div>
    <p style="margin-top:20px; font-size:13px; color:#6b7280;">
      Your shop will remain active as long as your subscription is active.
      If you have any questions, reply to this email.
    </p>
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} ${process.env.APP_NAME ?? "Marketplace"}. All rights reserved.
  </div>
</body>
</html>
`;

// create subscription, called after email verification. Creates a Razorpay subscription and
// returns the subscription_id to the frontend to open Razorpay checkout.

const createSubscription = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.user._id);

    if (!seller.isEmailVerified) {
        throw new APIError(403, "Please verify your email before subscribing");
    }

    if (seller.subscription.status === "active") {
        throw new APIError(400, "You already have an active subscription");
    }

    // create subscription on Razorpay
    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        total_count: 12, 
        quantity: 1,
        notes: {
            sellerId: seller._id.toString(),
            shopName: seller.shopName,
            email: seller.email,
        },
    });

    // save subscription id as pending
    seller.subscription.razorpaySubscriptionId = subscription.id;
    seller.subscription.status = "pending";
    seller.subscription.planId = process.env.RAZORPAY_PLAN_ID;
    await seller.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200, {
            subscriptionId: subscription.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            amount: PLAN_AMOUNT,
            currency: "INR",
            shopName: seller.shopName,
            email: seller.email,
        }, "Subscription created. Complete payment to activate your shop.")
    );
});

// verify payment , clled after Razorpay checkout succeeds on the frontend.
// Verifies the payment signature, activates subscription, sends invoice.

const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
        throw new APIError(400, "Payment verification details are incomplete");
    }

    // verify signature (MI)
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new APIError(400, "Payment signature verification failed");
    }

    const seller = await Seller.findOne({
        "subscription.razorpaySubscriptionId": razorpay_subscription_id,
    });

    if (!seller) {
        throw new APIError(404, "Seller not found for this subscription");
    }

    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    seller.subscription.status = "active";
    seller.subscription.startDate = now;
    seller.subscription.lastPaymentDate = now;
    seller.subscription.nextBillingDate = nextBillingDate;
    seller.subscription.endDate = nextBillingDate;
    await seller.save({ validateBeforeSave: false });


    const invoiceHTML = generateInvoiceHTML({
        seller,
        paymentId: razorpay_payment_id,
        amount: PLAN_AMOUNT,
        startDate: now,
        nextBillingDate,
    });

    await Promise.all([
        sendEmail({
            to: seller.email,
            subject: `Payment Confirmed — ${process.env.APP_NAME ?? "Marketplace"} Subscription`,
            html: invoiceHTML,
        }),
        sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Subscription Payment — ${seller.shopName}`,
            html: invoiceHTML,
        }),
    ]);

    return res.status(200).json(
        new APIResponse(200, {
            status: seller.subscription.status,
            startDate: seller.subscription.startDate,
            nextBillingDate: seller.subscription.nextBillingDate,
        }, "Payment verified. Your shop is now active and pending admin approval.")
    );
});

// ─── WEBHOOK HANDLER ──────────────────────────────────────────────────────────
// Razorpay calls this on every subscription event (renewal, failure, cancellation).
// Register this URL on Razorpay dashboard → Webhooks.
// This route must be excluded from verifyJWT — it comes from Razorpay, not the seller.

const webhookHandler = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // verify webhook signature
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (expectedSignature !== signature) {
        throw new APIError(400, "Invalid webhook signature");
    }

    const event = req.body.event;
    const payload = req.body.payload?.subscription?.entity;

    if (!payload) {
        return res.status(200).json({ received: true }); // ack unknown events
    }

    const seller = await Seller.findOne({
        "subscription.razorpaySubscriptionId": payload.id,
    });

    if (!seller) {
        return res.status(200).json({ received: true }); // ack but don't crash
    }

    switch (event) {

        // ── Renewal payment succeeded ─────────────────────────────────────────
        case "subscription.charged": {
            const now = new Date();
            const nextBillingDate = new Date(now);
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

            seller.subscription.status = "active";
            seller.subscription.lastPaymentDate = now;
            seller.subscription.nextBillingDate = nextBillingDate;
            seller.subscription.endDate = nextBillingDate;
            await seller.save({ validateBeforeSave: false });

            const paymentId = req.body.payload?.payment?.entity?.id ?? "N/A";
            const invoiceHTML = generateInvoiceHTML({
                seller,
                paymentId,
                amount: PLAN_AMOUNT,
                startDate: now,
                nextBillingDate,
            });

            await Promise.all([
                sendEmail({
                    to: seller.email,
                    subject: `Subscription Renewed — ${process.env.APP_NAME ?? "Marketplace"}`,
                    html: invoiceHTML,
                }),
                sendEmail({
                    to: ADMIN_EMAIL,
                    subject: `Subscription Renewed — ${seller.shopName}`,
                    html: invoiceHTML,
                }),
            ]);
            break;
        }

        // ── Payment failed (Razorpay will retry) ──────────────────────────────
        case "subscription.payment.failed": {
            seller.subscription.status = "expired";
            await seller.save({ validateBeforeSave: false });

            await sendEmail({
                to: seller.email,
                subject: `Subscription Payment Failed — Action Required`,
                html: `<p>Hi ${seller.fullName}, your subscription payment failed. Please update your payment method to keep your shop active.</p>`,
            });
            break;
        }

        // ── Seller cancelled subscription ─────────────────────────────────────
        case "subscription.cancelled": {
            seller.subscription.status = "cancelled";
            await seller.save({ validateBeforeSave: false });

            await sendEmail({
                to: seller.email,
                subject: `Subscription Cancelled — ${process.env.APP_NAME ?? "Marketplace"}`,
                html: `<p>Hi ${seller.fullName}, your subscription has been cancelled. Your shop will be deactivated at the end of the current billing period.</p>`,
            });
            break;
        }

        // ── Subscription completed (all billing cycles done) ──────────────────
        case "subscription.completed": {
            seller.subscription.status = "expired";
            await seller.save({ validateBeforeSave: false });
            break;
        }

        default:
            break;
    }

    return res.status(200).json({ received: true });
});

// cancel subscription

const cancelSubscription = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.user._id);

    if (seller.subscription.status !== "active") {
        throw new APIError(400, "No active subscription to cancel");
    }

    await razorpay.subscriptions.cancel(
        seller.subscription.razorpaySubscriptionId,
        { cancel_at_cycle_end: 1 } 
    );

    // webhook will update status to "cancelled" — but we note it's in progress
    return res.status(200).json(
        new APIResponse(200, null,
            "Cancellation requested. Your shop will remain active until the end of the current billing period."
        )
    );
});

export {
    createSubscription,
    verifyPayment,
    webhookHandler,
    cancelSubscription,
};