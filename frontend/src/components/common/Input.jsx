import { forwardRef, useId, useState } from "react";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";

/**
 * Works directly with React Hook Form's register():
 *   <Input label="Email" error={errors.email?.message} {...register("email")} />
 *
 * type="password" automatically gets a show/hide toggle.
 */

const Input = forwardRef(function Input({
    label,
    error,
    helperText,
    leftIcon,
    type = "text",
    required = false,
    className = "",
    id,
    ...props
  },ref,) {
    
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}

      <div
        className={[
          "flex h-10 overflow-hidden rounded-lg border bg-surface-raised transition-colors sm:h-11",

          error
            ? "border-error-border"
            : "border-border focus-within:border-primary",

          "focus-within:ring-2 focus-within:ring-primary/20",
        ].join(" ")}
      >
        {leftIcon && (
          <div className="flex w-10 shrink-0 items-center justify-center border-r border-border text-text-muted sm:w-11">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={[
            "flex-1 bg-transparent px-3 text-xs text-text outline-none placeholder:text-text-muted sm:px-4 sm:text-sm",

            isPassword ? "pr-0" : "",

            className,
          ].join(" ")}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex w-10 shrink-0 items-center justify-center border-l border-border text-text-muted hover:text-text sm:w-11"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash size={16} className="sm:hidden" /> : <Eye size={16} className="sm:hidden" />}
            {showPassword ? <EyeSlash size={18} className="hidden sm:block" /> : <Eye size={18} className="hidden sm:block" />}
          </button>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-xs text-error"
        >
          <WarningCircle size={14} weight="fill" />
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;



