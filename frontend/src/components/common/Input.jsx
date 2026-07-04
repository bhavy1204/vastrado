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
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center text-text-muted pointer-events-none">
            {leftIcon}
          </span>
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
            "w-full h-11 rounded-md bg-surface-raised border text-text text-sm",
            "placeholder:text-text-muted transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg",
            leftIcon ? "pl-10" : "pl-3.5",
            isPassword ? "pr-10" : "pr-3.5",
            error
              ? "border-error-border focus:ring-error"
              : "border-border focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface",
            className,
          ].join(" ")}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 flex items-center text-text-muted hover:text-text-secondary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
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



