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

// Create Subscription
// Called after seller verifies email.
// Creates a Razorpay Subscription and returns subscription_id
// to frontend so Checkout can be opened.

const createSubscription = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.user._id);

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (!seller.isEmailVerified) {
        throw new APIError(
            403,
            "Please verify your email before subscribing."
        );
    }

    if (seller.subscription.status === "active") {
        throw new APIError(
            400,
            "You already have an active subscription."
        );
    }

    // Prevent creating duplicate pending subscriptions
    if (
        seller.subscription.status === "pending" &&
        seller.subscription.razorpaySubscriptionId
    ) {

        return res.status(200).json(
            new APIResponse(
                200,
                {
                    subscriptionId:
                        seller.subscription.razorpaySubscriptionId,

                    razorpayKeyId:
                        process.env.RAZORPAY_KEY_ID,

                    amount: PLAN_AMOUNT,

                    currency: "INR",

                    shopName: seller.shopName,

                    email: seller.email
                },
                "Pending subscription already exists."
            )
        );
    }

    // Create Razorpay Subscription

    const subscription = await razorpay.subscriptions.create({

        plan_id: process.env.RAZORPAY_PLAN_ID,
        total_count: 12,
        quantity: 1,
        notes: {
            sellerId: seller._id.toString(),
            shopName: seller.shopName,
            email: seller.email
        }
    });

    seller.subscription.status = "pending";

    seller.subscription.planId =
        process.env.RAZORPAY_PLAN_ID;

    seller.subscription.razorpaySubscriptionId =
        subscription.id;

    seller.subscription.razorpayCustomerId =
        subscription.customer_id ?? null;

    await seller.save({
        validateBeforeSave: false
    });

    return res.status(200).json(

        new APIResponse(

            200,

            {

                subscriptionId: subscription.id,

                razorpayKeyId:
                    process.env.RAZORPAY_KEY_ID,

                amount: PLAN_AMOUNT,

                currency: "INR",

                shopName: seller.shopName,

                email: seller.email
            },

            "Subscription created successfully."

        )

    );

});

// ────────────────────────────────────────────────────────────────
// Verify first payment
//
// This only verifies Razorpay signature.
//
// DO NOT:
// - activate subscription
// - send invoice
// - update billing dates
//
// Razorpay Webhook is the single source of truth.
// ────────────────────────────────────────────────────────────────

const verifyPayment = asyncHandler(async (req, res) => {

    const {

        razorpay_payment_id,

        razorpay_subscription_id,

        razorpay_signature

    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
        throw new APIError(
            400,
            "Incomplete payment details."
        );

    }

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
            `${razorpay_payment_id}|${razorpay_subscription_id}`
        )
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {

        throw new APIError(
            400,
            "Payment signature verification failed."
        );

    }

    const seller = await Seller.findOne({ "subscription.razorpaySubscriptionId": razorpay_subscription_id });

    if (!seller) {
        throw new APIError(
            404,
            "Seller not found."
        );
    }

    return res.status(200).json(
        new APIResponse(
            200,
            {
                verified: true,

            },

            "Payment verified successfully. Waiting for Razorpay confirmation."

        )

    );

});

// ─── WEBHOOK HANDLER ──────────────────────────────────────────────────────────
// Razorpay calls this on every subscription event (renewal, failure, cancellation).
// Register this URL on Razorpay dashboard → Webhooks.
// This route must be excluded from verifyJWT — it comes from Razorpay, not the seller.

// ────────────────────────────────────────────────────────────────
// Razorpay Webhook
//
// Source of truth for subscription lifecycle.
//
// NOTE:
// - Route MUST NOT use verifyJWT
// - Route MUST use express.raw()
// - Verify signature BEFORE parsing JSON
// ────────────────────────────────────────────────────────────────

const webhookHandler = asyncHandler(async (req, res) => {
    console.log("Webhook reached");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Is Buffer:", Buffer.isBuffer(req.body));
    
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(req.body)
        .digest("hex");

    if (signature !== expectedSignature) {
        throw new APIError(400, "Invalid webhook signature");
    }

    // Parse body AFTER verification

    const body = JSON.parse(req.body.toString());

    const event = body.event;

    const subscription =
        body.payload?.subscription?.entity;

    if (!subscription) {
        return res.status(200).json({
            received: true
        });
    }

    const seller = await Seller.findOne({
        "subscription.razorpaySubscriptionId":
            subscription.id
    });

    if (!seller) {

        return res.status(200).json({
            received: true
        });

    }

    // Payment entity exists only on payment related events

    const payment =
        body.payload?.payment?.entity ?? null;

    const paymentId =
        payment?.id ?? null;

    switch (event) {

        // ==========================================================
        // FIRST PAYMENT SUCCESS
        // ==========================================================

        case "subscription.activated":

        // ==========================================================
        // RECURRING PAYMENT SUCCESS
        // ==========================================================

        case "subscription.charged": {

            // ---------------------------------------------
            // Prevent duplicate webhook execution
            // Razorpay can resend webhooks.
            // ---------------------------------------------

            if (
                paymentId &&
                seller.subscription.processedPayments.includes(paymentId)
            ) {

                return res.status(200).json({
                    received: true
                });

            }

            if (paymentId) {
                seller.subscription.processedPayments.push(
                    paymentId
                );
            }

            // ---------------------------------------------
            // Razorpay timestamps
            // ---------------------------------------------

            const currentStart =
                subscription.current_start
                    ? new Date(subscription.current_start * 1000)
                    : new Date();

            const currentEnd =
                subscription.current_end
                    ? new Date(subscription.current_end * 1000)
                    : null;

            const nextBilling =
                subscription.charge_at
                    ? new Date(subscription.charge_at * 1000)
                    : currentEnd;

            seller.subscription.status = "active";

            seller.subscription.planId =
                subscription.plan_id;

            seller.subscription.razorpayCustomerId =
                subscription.customer_id ?? null;

            seller.subscription.startDate ??=
                currentStart;

            seller.subscription.currentPeriodStart =
                currentStart;

            seller.subscription.currentPeriodEnd =
                currentEnd;

            seller.subscription.endDate =
                currentEnd;

            seller.subscription.lastPaymentDate =
                new Date();

            seller.subscription.nextBillingDate =
                nextBilling;

            await seller.save({
                validateBeforeSave: false
            });

            // ---------------------------------------------
            // Invoice
            // ---------------------------------------------

            const invoiceHTML =
                generateInvoiceHTML({

                    seller,

                    paymentId:
                        paymentId ?? "N/A",

                    amount:
                        payment?.amount
                            ? payment.amount / 100
                            : PLAN_AMOUNT,

                    startDate:
                        currentStart,

                    nextBillingDate:
                        nextBilling

                });

            await Promise.all([

                sendEmail({

                    to: seller.email,

                    subject:
                        event === "subscription.activated"

                            ? `Subscription Activated — ${process.env.APP_NAME}`

                            : `Subscription Renewed — ${process.env.APP_NAME}`,

                    html:
                        invoiceHTML

                }),

                sendEmail({

                    to: ADMIN_EMAIL,

                    subject:

                        event === "subscription.activated"

                            ? `New Seller Subscription — ${seller.shopName}`

                            : `Subscription Renewed — ${seller.shopName}`,

                    html:
                        invoiceHTML

                })

            ]);

            break;
        }
        // ==========================================================
        // PAYMENT FAILED
        // Razorpay is retrying payment.
        // Seller still has a chance to recover subscription.
        // ==========================================================

        case "subscription.pending": {

            seller.subscription.status = "past_due";

            await seller.save({
                validateBeforeSave: false
            });

            await sendEmail({

                to: seller.email,

                subject: `Subscription Payment Failed — Action Required`,

                html: `
                    <p>Hi ${seller.fullName},</p>

                    <p>
                        We couldn't process your subscription payment.
                    </p>

                    <p>
                        Razorpay will automatically retry the payment.
                    </p>

                    <p>
                        Please ensure that your payment method has sufficient balance.
                    </p>

                    <p>
                        If payment continues to fail your subscription may be halted.
                    </p>
                `
            });

            break;
        }

        // ==========================================================
        // ALL RETRIES FAILED
        // Subscription is now halted.
        // ==========================================================

        case "subscription.halted": {

            seller.subscription.status = "expired";

            await seller.save({
                validateBeforeSave: false
            });

            await sendEmail({

                to: seller.email,

                subject: `Subscription Halted — ${process.env.APP_NAME}`,

                html: `
                    <p>Hi ${seller.fullName},</p>

                    <p>
                        Your subscription has been halted because all automatic
                        payment retries have failed.
                    </p>

                    <p>
                        Please renew your subscription to reactivate your shop.
                    </p>
                `
            });

            break;
        }

        // ==========================================================
        // SELLER CANCELLED
        // ==========================================================

        case "subscription.cancelled": {

            seller.subscription.status = "cancelled";

            await seller.save({
                validateBeforeSave: false
            });

            await sendEmail({

                to: seller.email,

                subject: `Subscription Cancelled — ${process.env.APP_NAME}`,

                html: `
                    <p>Hi ${seller.fullName},</p>

                    <p>
                        Your subscription has been cancelled.
                    </p>

                    <p>
                        You will continue to have access until the end of your
                        current billing cycle.
                    </p>
                `
            });

            break;
        }

        // ==========================================================
        // SUBSCRIPTION COMPLETED
        // Fixed billing count reached.
        // ==========================================================

        case "subscription.completed": {

            seller.subscription.status = "expired";

            await seller.save({
                validateBeforeSave: false
            });

            break;
        }

        // ==========================================================

        default:
            break;

    }

    return res.status(200).json({
        received: true
    });

});

// cancel subscription

const cancelSubscription = asyncHandler(async (req, res) => {

    const seller = await Seller.findById(req.user._id);

    if (!seller) {
        throw new APIError(404, "Seller not found");
    }

    if (
        !["active", "past_due"].includes(
            seller.subscription.status
        )
    ) {
        throw new APIError(
            400,
            "No active subscription to cancel."
        );
    }

    if (!seller.subscription.razorpaySubscriptionId) {
        throw new APIError(
            400,
            "Subscription ID not found."
        );
    }

    await razorpay.subscriptions.cancel(
        seller.subscription.razorpaySubscriptionId,
        {
            cancel_at_cycle_end: 1
        }
    );

    return res.status(200).json(
        new APIResponse(
            200,
            null,
            "Cancellation requested successfully. Your shop will remain active until the end of the current billing cycle."
        )
    );

});

export {
    createSubscription,
    verifyPayment,
    webhookHandler,
    cancelSubscription,
};