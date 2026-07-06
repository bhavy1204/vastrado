import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react";

/**
 * SubscriptionStatusBadge
 *   <SubscriptionStatusBadge status="active" />
 *
 * status: "active" | "pending" | "expired" | "cancelled" (mirrors SUBSCRIPTION_STATUS constant)
 */
const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle,
    classes: "bg-success-bg text-success border-success-border",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-warning-bg text-warning border-warning-border",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    classes: "bg-error-bg text-error border-error-border",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-error-bg text-error border-error-border",
  },
};

export default function SubscriptionStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 text-xs font-medium rounded-full border px-2.5 py-1",
        config.classes,
      ].join(" ")}
    >
      <Icon size={12} weight="fill" />
      {config.label}
    </span>
  );
}

