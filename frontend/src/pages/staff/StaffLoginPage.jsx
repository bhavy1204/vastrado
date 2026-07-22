import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Envelope, LockKey } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { staffService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import { staffLoginSchema } from "@/lib/validators";
import { getStaffDashboardPath } from "@/lib/staffAuth";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await staffService.login(data);
      const staff = res.data.data;
      useAuthStore.getState().setStaff(staff);
      toast.success(`Welcome back${staff?.fullName ? `, ${staff.fullName}` : ""}`);
      navigate(getStaffDashboardPath(staff?.role), { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Staff login</h1>
          <p className="text-sm text-text-muted mt-1">
            Log in to access your staff dashboard
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

          <Input
            label="Password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
