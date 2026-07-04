import { Package } from "@phosphor-icons/react";
import Button from "./Button.jsx";

/**
 Usage
 *   <EmptyState
 *     icon={<MagnifyingGlass size={32} />}
 *     title="No products found"
 *     description="Try adjusting your filters or search term."
 *     actionLabel="Clear filters"
 *     onAction={handleClear}
 *   />
 */

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary-subtle text-primary mb-4">
        {icon || <Package size={26} weight="duotone" />}
      </div>

      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-5">{description}</p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}


