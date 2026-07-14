import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { userService, sellerService } from "@/api/index";
import { verifyEmailSchema } from "@/lib/validators";
import { OTP_PURPOSES } from "@/lib/constant";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * VerifyEmailPage
 * Common OTP screen for both user and seller sign-up. Rendered at both
 * /verify-email and /seller/verify-email — path decides which service
 * to call. Expects `email` in router state (passed from the register page);
 * falls back to asking again if the page was opened directly.
 *
 * NOTE: after verifying, a seller still needs to pay to activate their
 * subscription (register → verify email → pay), so sellers are routed to
 * /login with a reminder rather than straight into the dashboard — sellers
 * aren't authenticated yet at this point in the flow.
 */
export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSeller = location.pathname.startsWith("/seller");
  const email = location.state?.email;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: email || "" },
  });

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const service = isSeller ? sellerService : userService;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await service.verifyEmail({ ...data, purpose: OTP_PURPOSES?.EMAIL_VERIFICATION });
      toast.success("Email verified");

      if (isSeller) {
        toast("Log in and complete payment to activate your shop", { icon: "💳" });
        navigate("/login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid or expired code";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    try {
      await service.resendOTP({ email });
      toast.success("A new code has been sent");
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't resend the code");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Verify your email</h1>
          <p className="text-sm text-text-muted mt-1">
            {email
              ? <>We sent a code to <span className="text-text font-medium">{email}</span></>
              : "Enter the code sent to your email"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!email && (
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          )}

          <Input
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            error={errors.otp?.message}
            {...register("otp")}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Verify
          </Button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-sm text-primary hover:underline disabled:text-text-muted disabled:no-underline disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

