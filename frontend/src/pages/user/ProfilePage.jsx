import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, LockKey, MapPin, Plus, Trash, Star } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import { addressSchema, changePasswordSchema } from "@/lib/validators";
import { ADDRESS_LABELS } from "@/lib/constant";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

/**
 * User ProfilePage — /profile
 * Three sections: basic info edit, addresses (add/delete/set default),
 * change password. Addresses are assumed to live on the user document
 * (per your Address CRUD service methods) rather than a separate collection.
 */
export default function ProfilePage() {
  const { user, updateUserState } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <h1 className="text-lg font-bold text-text">Your profile</h1>

      <BasicInfoSection user={user} onSaved={updateUserState} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
            Addresses
          </h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} weight="bold" />}
            onClick={() => setIsAddressModalOpen(true)}
          >
            Add address
          </Button>
        </div>
        <AddressList user={user} onChanged={updateUserState} />
      </section>

      <ChangePasswordSection />

      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaved={(addresses) => {
          updateUserState({ addresses });
          setIsAddressModalOpen(false);
        }}
      />
    </div>
  );
}

function BasicInfoSection({ user, onSaved }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: user?.fullName || "", phone: user?.phone || "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await userService.updateProfile(data);
      onSaved(res.data.data || data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
        Basic info
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" leftIcon={<User size={16} />} error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email" value={user?.email || ""} disabled leftIcon={<User size={16} />} />
        <Input label="Phone number" type="tel" leftIcon={<Phone size={16} />} error={errors.phone?.message} {...register("phone")} />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="self-start">
          Save changes
        </Button>
      </form>
    </section>
  );
}

function AddressList({ user, onChanged }) {
  const addresses = user?.addresses || [];
  const [actioningId, setActioningId] = useState(null);

  const handleSetDefault = async (address) => {
    setActioningId(address._id);
    try {
      const res = await userService.setDefaultAddress(address._id);
      onChanged({ addresses: res.data.data.addresses || res.data.data });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't set default address");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (address) => {
    if (!window.confirm("Delete this address?")) return;
    setActioningId(address._id);
    try {
      const res = await userService.deleteAddress(address._id);
      onChanged({ addresses: res.data.data.addresses || res.data.data });
      toast.success("Address removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete this address");
    } finally {
      setActioningId(null);
    }
  };

  if (addresses.length === 0) {
    return <p className="text-sm text-text-muted">No saved addresses yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {addresses.map((address) => (
        <div key={address._id} className="flex items-start gap-3 rounded-md border border-border bg-surface-raised p-3">
          <MapPin size={16} className="text-text-muted shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text">{address.label}</span>
              {address.isDefault && (
                <span className="text-xs text-primary bg-primary-subtle rounded-full px-2 py-0.5">Default</span>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{address.line1}, {address.city}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefault(address)}
                disabled={actioningId === address._id}
                aria-label="Set as default"
                className="text-text-muted hover:text-primary p-1.5 disabled:opacity-50"
              >
                <Star size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(address)}
              disabled={actioningId === address._id}
              aria-label="Delete address"
              className="text-text-muted hover:text-error p-1.5 disabled:opacity-50"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressFormModal({ isOpen, onClose, onSaved }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "", line1: "", city: "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await userService.addAddress(data);
      onSaved(res.data.data.addresses || res.data.data);
      reset();
      toast.success("Address added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't add this address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add address" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">Label</label>
          <select
            className="h-11 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            {...register("label")}
          >
            <option value="">Select...</option>
            {ADDRESS_LABELS.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          {errors.label && <p className="text-xs text-error">{errors.label.message}</p>}
        </div>

        <Input label="Address line" error={errors.line1?.message} {...register("line1")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>Add address</Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangePasswordSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await userService.changePassword(data);
      toast.success("Password updated");
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
        Change password
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
        <Input label="Current password" type="password" leftIcon={<LockKey size={16} />} error={errors.currentPassword?.message} {...register("currentPassword")} />
        <Input label="New password" type="password" leftIcon={<LockKey size={16} />} error={errors.newPassword?.message} {...register("newPassword")} />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="self-start">
          Update password
        </Button>
      </form>
    </section>
  );
}

