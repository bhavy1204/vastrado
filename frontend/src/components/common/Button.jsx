import { forwardRef } from "react";
import { CircleNotch } from "@phosphor-icons/react";

/*
 * variant: "primary" | "secondary" | "outline" | "ghost" | "danger"
 * size: "sm" | "md" | "lg"
 */

const VARIANT_CLASSES = {
  primary: `
    bg-primary
    text-text-on-primary
    border border-transparent
    shadow-sm
    hover:bg-primary-hover
    hover:shadow-md
  `,

  secondary: `
    bg-surface-raised
    text-text
    border border-border
    hover:border-primary/30
    hover:bg-surface
  `,

  outline: `
    bg-transparent
    text-primary
    border border-primary/70
    hover:bg-primary/5
    hover:border-primary
  `,

  ghost: `
    bg-transparent
    text-text-secondary
    border border-transparent
    hover:bg-surface-raised
    hover:text-text
  `,

  danger: `
    bg-error
    text-white
    border border-transparent
    shadow-sm
    hover:opacity-95
    hover:shadow-md
  `,
};

const SIZE_CLASSES = {
  sm: "h-10 px-4 text-sm gap-2",
  md: "h-11 px-5 text-sm gap-2.5",
  lg: "h-12 px-7 text-base gap-3",
};

const Button = forwardRef(function Button(
  {
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
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        "inline-flex items-center justify-center",
        "rounded-xl",
        "font-medium tracking-[0.01em]",
        "select-none whitespace-nowrap",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-bg",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        "disabled:hover:translate-y-0",
        "disabled:hover:shadow-none",
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
        leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {leftIcon}
          </span>
        )
      )}

      {children && (
        <span className="inline-flex items-center whitespace-nowrap">
          {children}
        </span>
      )}

      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0 items-center justify-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

export default Button;
