import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { paymentService, sellerService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import { formatDate, formatPrice } from "@/lib/formatters";
import SubscriptionStatusBadge from "@/components/seller/SubscriptionStatusBadge";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";

/**
 * Seller SubscriptionPage — /seller/subscription
 * Loads the Razorpay checkout script on demand, creates a subscription
 * order on the backend, opens Razorpay's modal, then verifies payment
 * with the returned signature.
 *
 * NOTE: assumes createSubscription() returns { orderId, amount, currency,
 * keyId } and verifyPayment expects { razorpay_order_id,
 * razorpay_payment_id, razorpay_signature } — standard Razorpay shape,
 * adjust field names if your webhook contract differs.
 */
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const MONTHLY_PRICE = 500;

export default function SellerSubscriptionPage() {
  const { seller, updateSellerState } = useAuthStore();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    sellerService
      .getSubscription()
      .then((res) => {
        if (!isCancelled) setSubscription(res.data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Couldn't load the payment gateway. Check your connection.");
        return;
      }

      const { data: order } = await paymentService.createSubscription();

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "ClothMarket",
        description: "Monthly seller subscription",
        prefill: { name: seller?.shopName, email: seller?.email },
        theme: { color: "#C0622A" },
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Subscription activated");
            updateSellerState({ subscriptionStatus: "active" });
            const res = await sellerService.getSubscription();
            setSubscription(res.data.data);
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't start the payment process");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription? Your shop will stop appearing in search once it expires.")) return;
    setIsProcessing(true);
    try {
      await paymentService.cancelSubscription();
      toast.success("Subscription cancelled");
      updateSellerState({ subscriptionStatus: "cancelled" });
      const res = await sellerService.getSubscription();
      setSubscription(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't cancel your subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <Loader className="py-16" label="Loading subscription details..." />;
  }

  const status = subscription?.status || seller?.subscriptionStatus;
  const isActive = status === "active";

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-lg">
      <h1 className="text-lg font-bold text-text">Subscription</h1>

      <div className="rounded-md border border-border bg-surface-raised p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text">Current plan</p>
          {status && <SubscriptionStatusBadge status={status} />}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-text">{formatPrice(MONTHLY_PRICE)}</span>
          <span className="text-sm text-text-muted">/ month</span>
        </div>

        {subscription?.nextBillingDate && (
          <p className="text-xs text-text-muted">
            {isActive ? "Renews" : "Expired"} on {formatDate(subscription.nextBillingDate)}
          </p>
        )}

        <ul className="flex flex-col gap-2 text-sm text-text-secondary">
          <Feature>List unlimited products</Feature>
          <Feature>Appear in nearby-shop search</Feature>
          <Feature>Public shop profile page</Feature>
        </ul>

        {isActive ? (
          <Button variant="secondary" isLoading={isProcessing} onClick={handleCancel}>
            Cancel subscription
          </Button>
        ) : (
          <Button
            variant="primary"
            leftIcon={<CreditCard size={16} />}
            isLoading={isProcessing}
            onClick={handleSubscribe}
          >
            Subscribe now
          </Button>
        )}
      </div>

      {!isActive && (
        <div className="flex items-start gap-2 text-xs text-text-muted">
          <WarningCircle size={14} className="shrink-0 mt-0.5" />
          <span>Your shop stays hidden from customers until your subscription is active.</span>
        </div>
      )}
    </div>
  );
}

function Feature({ children }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle size={16} weight="fill" className="text-success shrink-0" />
      {children}
    </li>
  );
}

