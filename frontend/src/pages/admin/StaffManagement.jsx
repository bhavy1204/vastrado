import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserCircle,
  Plus,
  Trash,
  Prohibit,
  CheckCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api/index";
import { createStaffSchema } from "@/lib/validators";
import { formatDate } from "@/lib/formatters";
import usePagination from "@/hooks/usePagination";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

const ROLE_LABELS = {
  "city-admin": "City Admin",
  "delivery-agent": "Delivery Agent",
  "support-team": "Support Team",
};

const STATUS_COLORS = {
  approved: "bg-green-500/10 text-green-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  suspended: "bg-red-500/10 text-red-600",
};

const DEFAULT_STAFF_VALUES = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  altPhone: "",
  role: "delivery-agent",
  cityId: "",
  avatar: "",
};

function getCityLabel(city) {
  if (!city) return "—";
  if (typeof city === "string") return city;
  return [city.name, city.state].filter(Boolean).join(", ");
}

export default function StaffManagement() {
  const {
    page,
    limit,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    resetPage,
  } = usePagination();

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const fetchStaff = useCallback(() => {
    setIsLoading(true);
    adminService
      .getAllStaff()
      .then((res) => setStaff(res.data?.data ?? []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load staff"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const filteredStaff = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) =>
      member.email?.toLowerCase().includes(query),
    );
  }, [staff, debouncedSearch]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredStaff.length / limit)));
  }, [filteredStaff.length, limit, setTotalPages]);

  const paginatedStaff = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredStaff.slice(start, start + limit);
  }, [filteredStaff, page, limit]);

  const openCreateModal = () => setIsModalOpen(true);

  const handleActivate = async (member) => {
    setActioningId(member._id);
    try {
      await adminService.activateStaff(member._id);
      toast.success(`${member.fullName} activated`);
      fetchStaff();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't activate this staff member",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleSuspend = async (member) => {
    if (
      !window.confirm(
        `Suspend ${member.fullName}? They will lose access until reactivated.`,
      )
    )
      return;
    setActioningId(member._id);
    try {
      await adminService.suspendStaff(member._id);
      toast.success(`${member.fullName} suspended`);
      fetchStaff();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't suspend this staff member",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (member) => {
    if (
      !window.confirm(
        `Delete ${member.fullName}? This action cannot be undone.`,
      )
    )
      return;
    setActioningId(member._id);
    try {
      await adminService.deleteStaff(member._id);
      toast.success("Staff member deleted");
      fetchStaff();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't delete this staff member",
      );
    } finally {
      setActioningId(null);
    }
  };

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Staff Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage city admins, delivery agents, and support staff.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email..."
            className="h-11 w-full sm:w-72 rounded-lg border border-border bg-surface-raised px-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <Button
            variant="primary"
            leftIcon={<Plus size={18} weight="bold" />}
            onClick={openCreateModal}
          >
            Create Staff
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading staff..." />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={<UserCircle size={30} weight="duotone" />}
          title={isSearching ? "No staff found" : "No staff added yet"}
          actionLabel={isSearching ? undefined : "Create Staff"}
          onAction={isSearching ? undefined : openCreateModal}
        />
      ) : (
        <div className="grid gap-5">
          {paginatedStaff.map((member) => (
            <div
              key={member._id}
              className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                        {member.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h2 className="text-lg font-semibold text-text">
                        {member.fullName}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {member.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span>{member.phone}</span>
                      {member.altPhone && (
                        <span className="text-text-muted">
                          Alt: {member.altPhone}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {ROLE_LABELS[member.role] || member.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_COLORS[member.status] ||
                          "bg-border text-text"
                        }`}
                      >
                        {member.status}
                      </span>

                      <span className="text-xs text-text-muted">
                        {getCityLabel(member.cityId)}
                      </span>
                    </div>

                    <p className="text-sm text-text-muted">
                      Joined {formatDate(member.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {member.status !== "approved" && (
                    <Button
                      variant="secondary"
                      leftIcon={<CheckCircle size={16} />}
                      isLoading={actioningId === member._id}
                      onClick={() => handleActivate(member)}
                    >
                      Activate
                    </Button>
                  )}

                  {member.status !== "suspended" && (
                    <Button
                      variant="secondary"
                      leftIcon={<Prohibit size={16} />}
                      isLoading={actioningId === member._id}
                      onClick={() => handleSuspend(member)}
                    >
                      Suspend
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    leftIcon={<Trash size={16} />}
                    isLoading={actioningId === member._id}
                    onClick={() => handleDelete(member)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredStaff.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onNext={nextPage}
          onPrev={prevPage}
          onGoTo={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}

      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          fetchStaff();
        }}
      />
    </div>
  );
}

function CreateStaffModal({ isOpen, onClose, onCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStaffSchema),
    defaultValues: DEFAULT_STAFF_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(DEFAULT_STAFF_VALUES);
    setIsLoadingCities(true);
    adminService
      .getAllActiveCities()
      .then((res) => setCities(res.data?.data ?? []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load cities"),
      )
      .finally(() => setIsLoadingCities(false));
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await adminService.createStaff(data);
      toast.success("Staff member created");
      onCreated();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't create this staff member",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Staff" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full name"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            type="tel"
            required
            helperText="10-digit Indian mobile number"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Alternate phone"
            type="tel"
            helperText="Optional"
            error={errors.altPhone?.message}
            {...register("altPhone")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">
              Role<span className="ml-0.5 text-error">*</span>
            </label>
            <select
              className="h-11 rounded-lg border border-border bg-surface-raised px-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("role")}
            >
              <option value="city-admin">City Admin</option>
              <option value="delivery-agent">Delivery Agent</option>
              <option value="support-team">Support Team</option>
            </select>
            {errors.role && (
              <p className="text-xs text-error">{errors.role.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">
              Assigned city<span className="ml-0.5 text-error">*</span>
            </label>
            <select
              disabled={isLoadingCities}
              className="h-11 rounded-lg border border-border bg-surface-raised px-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              {...register("cityId")}
            >
              <option value="">
                {isLoadingCities ? "Loading cities..." : "Select a city"}
              </option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {[city.name, city.state].filter(Boolean).join(", ")}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-xs text-error">{errors.cityId.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Avatar URL"
          helperText="Optional"
          error={errors.avatar?.message}
          {...register("avatar")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
}
