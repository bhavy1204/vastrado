import { forwardRef } from "react";
import { CircleNotch } from "@phosphor-icons/react";

/*
 * variant: "primary" | "secondary" | "outline" | "ghost" | "danger"
 * size: "sm" | "md" | "lg"
 */

const VARIANT_CLASSES = {
  primary:
    "bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-hover border border-transparent",

  secondary:
    "bg-surface text-text hover:bg-border border border-border active:bg-border-strong",

  outline:
    "bg-transparent text-primary hover:bg-primary-subtle border border-primary active:bg-primary-subtle",

  ghost:
    "bg-transparent text-text-secondary hover:bg-surface hover:text-text border border-transparent",

  danger: "bg-error text-white hover:opacity-90 border border-transparent",

};

const SIZE_CLASSES = {
  sm: "h-9 px-3 text-sm gap-1.5",

  md: "h-11 px-4 text-sm gap-2",

  lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef(function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    type = "button",
    className = "",
    ...props
  },ref,){

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}

      {...props}
    >
      {isLoading ? (
        <CircleNotch
          className="animate-spin"
          size={size === "sm" ? 16 : 18}
          weight="bold"
        />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;


