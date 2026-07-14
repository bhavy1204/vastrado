import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams, useNavigate, Link } from "react-router-dom";
import { LockKey, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService, sellerService } from "@/api/index";
import { resetPasswordSchema } from "@/lib/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * ResetPasswordPage
 * Common for both actors — rendered at /reset-password and
 * /seller/reset-password, opened from the emailed reset link
 * (?token=...).
 */
export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isSeller = location.pathname.startsWith("/seller");
  const service = isSeller ? sellerService : userService;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await service.resetPassword({ ...data, token });
      toast.success("Password updated — please log in");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "That reset link is invalid or expired");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-3">
          <WarningCircle size={40} weight="fill" className="text-error" />
          <h1 className="text-xl font-bold text-text">Invalid reset link</h1>
          <p className="text-sm text-text-muted">
            This link is missing or has expired. Request a new one to continue.
          </p>
          <Link
            to="/forgot-password"
            className="text-sm text-primary font-medium hover:underline mt-2"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Set a new password</h1>
          <p className="text-sm text-text-muted mt-1">Choose a strong password you haven't used before</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm new password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}

