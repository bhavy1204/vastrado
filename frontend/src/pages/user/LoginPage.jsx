import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Envelope, LockKey, IdentificationCard } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService, sellerService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import { userLoginSchema, sellerLoginSchema } from "@/lib/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * LoginPage
 * Single common page for user, seller, and admin login (backend JWT `type`
 * claim differentiates). Rendered at both /login and /seller/login —
 * the route path decides which tab is active by default.
 *
 * User tab covers both regular users and admins: the backend returns the
 * actor's role, and we redirect accordingly after a successful login.
 */
const TABS = {
  user: {
    key: "user",
    label: "Customer",
    schema: userLoginSchema,
    fieldName: "identifier",
    fieldLabel: "Email or username",
    fieldIcon: <Envelope size={16} />,
    fieldType: "text",
  },
  seller: {
    key: "seller",
    label: "Seller",
    schema: sellerLoginSchema,
    fieldName: "identifier",
    fieldLabel: "Email or username",
    fieldIcon: <IdentificationCard size={16} />,
    fieldType: "text",
  },
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setSeller } = useAuthStore();

  const [activeTab, setActiveTab] = useState(
    location.pathname.startsWith("/seller") ? "seller" : "user"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tab = TABS[activeTab];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tab.schema),
  });

  // Reset form state when switching tabs so stale errors/values don't linger
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (activeTab === "user") {
        const res = await userService.login(data);
        const user = res.data.data.user ?? res.data.data;
        setUser(user);
        toast.success(`Welcome back${user?.fullName ? `, ${user.fullName}` : ""}`);
        navigate(user?.role === "admin" ? "/admin/dashboard" : "/", { replace: true });
      } else {
        const res = await sellerService.login(data);
        const seller = res.data.data.seller ?? res.data.data;
        setSeller(seller);
        toast.success(`Welcome back, ${seller?.shopName ?? "seller"}`);
        navigate("/seller/dashboard", { replace: true });
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Log in to continue to ClothMarket</p>
        </div>

        <div className="flex rounded-md bg-surface border border-border p-1 mb-6">
          {Object.values(TABS).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={[
                "flex-1 h-9 rounded-sm text-sm font-medium transition-colors",
                activeTab === t.key
                  ? "bg-surface-raised text-text shadow-sm"
                  : "text-text-muted hover:text-text-secondary",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label={tab.fieldLabel}
            type={tab.fieldType}
            leftIcon={tab.fieldIcon}
            error={errors[tab.fieldName]?.message}
            {...register(tab.fieldName)}
          />

          <Input
            label="Password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end -mt-2">
            <Link
              to={activeTab === "seller" ? "/seller/forgot-password" : "/forgot-password"}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        {activeTab === "user" && (
          <p className="text-center text-sm text-text-muted mt-6">
            New here?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

