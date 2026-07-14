import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Envelope, LockKey, Phone } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService } from "@/api/index";
import { userRegisterSchema } from "@/lib/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * RegisterPage (user)
 * On success, backend sends an OTP to the given email — we forward the
 * user to /verify-email with the email in router state so that page
 * doesn't need to ask for it again.
 *
 * NOTE: field set (fullName, email, phone, password, confirmPassword)
 * is assumed to match userRegisterSchema — adjust if your schema differs.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userRegisterSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await userService.register(data);
      toast.success("Account created — check your email for the OTP");
      navigate("/verify-email", { state: { email: data.email }, replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Couldn't create your account. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Create your account</h1>
          <p className="text-sm text-text-muted mt-1">
            Join ShopNearby to discover shops near you
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full name"
            leftIcon={<User size={16} />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Email"
            type="email"
            leftIcon={<Envelope size={16} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone number"
            type="tel"
            leftIcon={<Phone size={16} />}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="Password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

