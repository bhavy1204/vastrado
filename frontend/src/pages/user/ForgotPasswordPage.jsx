import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, Link } from "react-router-dom";
import { Envelope, CheckCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService, sellerService } from "@/api/index";
import { forgotPasswordSchema } from "@/lib/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * ForgotPasswordPage
 * Common for both actors — rendered at /forgot-password and
 * /seller/forgot-password. Sends a reset link to the given email;
 * the link lands on ResetPasswordPage with a token in the query string.
 */
export default function ForgotPasswordPage() {
  const location = useLocation();
  const isSeller = location.pathname.startsWith("/seller");
  const service = isSeller ? sellerService : userService;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await service.forgotPassword(data);
      setIsSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't send the reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        {isSent ? (
          <div className="text-center flex flex-col items-center gap-3">
            <CheckCircle size={40} weight="fill" className="text-success" />
            <h1 className="text-xl font-bold text-text">Check your email</h1>
            <p className="text-sm text-text-muted">
              If an account exists for that email, we've sent a link to reset your password.
            </p>
            <Link to="/login" className="text-sm text-primary font-medium hover:underline mt-2">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-text">Forgot your password?</h1>
              <p className="text-sm text-text-muted mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                leftIcon={<Envelope size={16} />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

