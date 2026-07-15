import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Storefront,
  Envelope,
  LockKey,
  Phone,
  MapPin,
  User,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { sellerService } from "@/api/index";
import { sellerRegisterSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/formatters";
import useGeolocation from "@/lib/useGeoLocation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * Seller RegisterPage — /seller/register only, no nav link anywhere
 * pointing here (per your decision). FormData body carries avatar, banner,
 * and location (GeoJSON [lng, lat] — flipped from the hook's {lat, lng}).
 *
 * NOTE: field set assumed from your backend notes — shopName, email, phone,
 * username, password, confirmPassword, description, avatar, banner,
 * location. Adjust names to match sellerRegisterSchema exactly.
 */
export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const {
    coords,
    error: geoError,
    isLoading: isLocating,
    requestLocation,
  } = useGeolocation();

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerRegisterSchema),
  });

  const handleFileChange = (e, setFile) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMessage = validateImageFile(file, 5);
    if (errorMessage) {
      toast.error(errorMessage);
      e.target.value = "";
      return;
    }
    setFile(file);
  };

  const onSubmit = async (data) => {
    if (!coords) {
      toast.error("Please share your shop's location before continuing");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        formData.append(key, value),
      );

      // GeoJSON is [lng, lat] — flipped from the hook's {lat, lng}
      formData.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        }),
      );

      if (avatarFile) formData.append("avatar", avatarFile);
      if (bannerFile) formData.append("banner", bannerFile);

      await sellerService.register(formData);
      toast.success("Shop registered — check your email for the OTP");
      navigate("/seller/verify-email", {
        state: { email: data.email },
        replace: true,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Couldn't register your shop. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Register your shop</h1>
          <p className="text-sm text-text-muted mt-1">
            List your shop on ClothMarket for ₹500/month
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Shop name"
            leftIcon={<Storefront size={16} />}
            error={errors.shopName?.message}
            {...register("shopName")}
          />

          <Input
            label="Your full name"
            leftIcon={<User size={16} />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Username"
            helperText="Used for seller login (email works too)"
            error={errors.username?.message}
            {...register("username")}
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
            label="WhatsApp number"
            type="tel"
            helperText="Customers will contact you here"
            leftIcon={<Phone size={16} />}
            error={errors.whatsappNumber?.message}
            {...register("whatsappNumber")}
          />

          <Input
            label="Alternate phone (optional)"
            type="tel"
            leftIcon={<Phone size={16} />}
            error={errors.altPhone?.message}
            {...register("altPhone")}
          />

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              Shop description
            </label>
            <textarea
              rows={3}
              placeholder="What do you sell? Tell customers about your shop."
              className="w-full rounded-md border border-border bg-surface-raised text-sm text-text placeholder:text-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              {...register("shopDescription")}
            />
            {errors.shopDescription && (
              <p className="text-xs text-error mt-1">
                {errors.shopDescription.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              Shop category
            </label>
            <select
              className="w-full h-11 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              defaultValue=""
              {...register("shopCategory")}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="clothing">clothing</option>
              <option value="womens-wear">Women's wear</option>
              <option value="kids-wear">Kids' wear</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
              <option value="ethnic-wear">Ethnic wear</option>
              <option value="other">Other</option>
            </select>
            {errors.shopCategory && (
              <p className="text-xs text-error mt-1">
                {errors.shopCategory.message}
              </p>
            )}
          </div>

          <Input
            label="Address line 1"
            leftIcon={<MapPin size={16} />}
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />

          <Input
            label="Address line 2 (optional)"
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="State"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>

          <Input
            label="Postal code"
            inputMode="numeric"
            maxLength={6}
            error={errors.postalCode?.message}
            {...register("postalCode")}
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

          <div className="grid grid-cols-2 gap-3">
            <FileField
              label="Shop avatar"
              icon={<ImageIcon size={16} />}
              file={avatarFile}
              onChange={(e) => handleFileChange(e, setAvatarFile)}
            />
            <FileField
              label="Shop banner"
              icon={<ImageIcon size={16} />}
              file={bannerFile}
              onChange={(e) => handleFileChange(e, setBannerFile)}
            />
          </div>

          <div className="rounded-md border border-border bg-surface p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary min-w-0">
              <MapPin size={16} className="shrink-0" />
              {coords ? (
                <span className="truncate">
                  Location captured ({coords.lat.toFixed(3)},{" "}
                  {coords.lng.toFixed(3)})
                </span>
              ) : (
                <span className="truncate">
                  {geoError
                    ? "Location access denied"
                    : "Shop location required"}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isLocating}
              onClick={requestLocation}
            >
              {coords ? "Update" : "Share location"}
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Register shop
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function FileField({ label, icon, file, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 cursor-pointer">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="h-11 rounded-md border border-dashed border-border-strong bg-surface flex items-center gap-2 px-3 text-text-muted hover:border-primary hover:text-primary transition-colors">
        {icon}
        <span className="text-xs truncate">
          {file ? file.name : "Choose image"}
        </span>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onChange}
      />
    </label>
  );
}
