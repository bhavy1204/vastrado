import api from "../axios.js";

const BASE = "/v1/payment";

const paymentService = {

  // public

  // No frontend call needed — listed here only for documentation, webhook: NOT called from frontend

  // protected

  // Step 1: Creates a Razorpay subscription and returns subscription details to open the Razorpay checkout modal on the frontend.
  // Returns: { subscriptionId, amount, currency, keyId }
  createSubscription: () =>
    api.post(`${BASE}/subscribe`),

  // Step 2: Called after Razorpay checkout modal closes successfully.
  // Sends HMAC signature for backend verification before activating seller.
  // data: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
  verifyPayment: (data) =>
    api.post(`${BASE}/verify`, data),

  // Cancels at end of current billing cycle (cancel_at_cycle_end: 1).
  // Does NOT immediately revoke access.
  cancelSubscription: () =>
    api.post(`${BASE}/cancel`),
};

export default paymentService;