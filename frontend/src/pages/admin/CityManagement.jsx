import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Trash, ToggleLeft, ToggleRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api/index";
import { createCitySchema } from "@/lib/validators";
import { formatDate } from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

const DEFAULT_CITY_VALUES = {
  name: "",
  state: "",
  country: "india",
  settings: {
    deliveryCharge: 0,
    freeDeliveryAbove: 0,
    allowedCOD: false,
    supportEmail: "",
    supportPhone: "",
  },
};

export default function CityManagement() {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const fetchCities = useCallback(() => {
    setIsLoading(true);
    adminService
      .getAllCities()
      .then((res) => setCities(res.data?.data ?? []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load cities"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const openCreateModal = () => setIsModalOpen(true);

  const handleToggleStatus = async (city) => {
    setActioningId(city._id);
    try {
      await adminService.toggleCityStatus(city._id);
      toast.success(
        `${city.name} ${city.isActive ? "deactivated" : "activated"}`,
      );
      fetchCities();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't update city status",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (city) => {
    if (
      !window.confirm(
        `Delete ${city.name}? This will remove the city permanently.`,
      )
    )
      return;
    setActioningId(city._id);
    try {
      await adminService.deleteCity(city._id);
      toast.success("City deleted");
      fetchCities();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete this city");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">City Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage marketplace cities and their delivery settings.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={18} weight="bold" />}
          onClick={openCreateModal}
        >
          Create City
        </Button>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading cities..." />
      ) : cities.length === 0 ? (
        <EmptyState
          icon={<MapPin size={30} weight="duotone" />}
          title="No cities added yet"
          actionLabel="Create City"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-5">
          {cities.map((city) => (
            <div
              key={city._id}
              className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin size={24} weight="duotone" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h2 className="text-lg font-semibold capitalize text-text">
                        {city.name}
                      </h2>
                      <p className="text-sm capitalize text-text-secondary">
                        {city.state}, {city.country}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          city.isActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {city.isActive ? "Active" : "Inactive"}
                      </span>

                      {city.settings && (
                        <span className="text-xs text-text-muted">
                          Delivery ₹{city.settings.deliveryCharge} · Free above
                          ₹{city.settings.freeDeliveryAbove}
                          {city.settings.allowedCOD ? " · COD allowed" : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-muted">
                      Added {formatDate(city.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    leftIcon={
                      city.isActive ? (
                        <ToggleRight size={16} />
                      ) : (
                        <ToggleLeft size={16} />
                      )
                    }
                    isLoading={actioningId === city._id}
                    onClick={() => handleToggleStatus(city)}
                  >
                    {city.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  <Button
                    variant="danger"
                    leftIcon={<Trash size={16} />}
                    isLoading={actioningId === city._id}
                    onClick={() => handleDelete(city)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          fetchCities();
        }}
      />
    </div>
  );
}

function CreateCityModal({ isOpen, onClose, onCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCitySchema),
    defaultValues: DEFAULT_CITY_VALUES,
  });

  useEffect(() => {
    if (isOpen) reset(DEFAULT_CITY_VALUES);
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await adminService.createCity(data);
      toast.success("City created");
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't create this city");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create City" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City name"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="State"
            required
            error={errors.state?.message}
            {...register("state")}
          />
        </div>

        <Input
          label="Country"
          error={errors.country?.message}
          {...register("country")}
        />

        <p className="text-sm font-semibold text-text">Delivery settings</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Delivery charge (₹)"
            type="number"
            min={0}
            required
            error={errors.settings?.deliveryCharge?.message}
            {...register("settings.deliveryCharge")}
          />
          <Input
            label="Free delivery above (₹)"
            type="number"
            min={0}
            required
            error={errors.settings?.freeDeliveryAbove?.message}
            {...register("settings.freeDeliveryAbove")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Support email"
            type="email"
            required
            error={errors.settings?.supportEmail?.message}
            {...register("settings.supportEmail")}
          />
          <Input
            label="Support phone"
            type="tel"
            required
            helperText="10-digit Indian mobile number"
            error={errors.settings?.supportPhone?.message}
            {...register("settings.supportPhone")}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            {...register("settings.allowedCOD")}
          />
          Allow cash on delivery (COD)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create City
          </Button>
        </div>
      </form>
    </Modal>
  );
}
