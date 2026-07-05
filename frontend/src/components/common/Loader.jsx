import { CircleNotch } from "@phosphor-icons/react";

/**
 *
 * Inline:      <Loader size="sm" />
 * Full page:   <Loader fullPage label="Loading your dashboard..." />
 * Section:     <Loader className="py-16" label="Loading products..." />
 */


export default function Loader({
  size = "md",
  label,
  fullPage = false,
  className = "",
}) {
  const pxSize = { sm: 16, md: 24, lg: 32 }[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <CircleNotch
        size={pxSize}
        weight="bold"
        className="animate-spin text-primary"
      />
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className={["flex items-center justify-center", className].join(" ")}>
      {spinner}
    </div>
  );
}

