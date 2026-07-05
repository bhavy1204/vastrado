import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

/**
 * Modal
 *
 *   <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add address">
 *     ...form...
 *   </Modal>
 *
 * size: "sm" | "md" | "lg"
 */

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdropClick = true,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-text/40 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={[
          "relative w-full rounded-lg bg-surface-raised border border-border shadow-xl",
          "max-h-[90vh] flex flex-col outline-none",
          SIZE_CLASSES[size],
        ].join(" ")}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            {title && (
              <h2 className="text-base font-semibold text-text">{title}</h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-auto text-text-muted hover:text-text rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="px-5 py-4 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}


