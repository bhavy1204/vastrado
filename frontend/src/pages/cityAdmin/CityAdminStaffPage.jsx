import { useEffect, useState, useCallback, useMemo } from "react";
import { UserCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { cityAdminService } from "@/api/index";
import usePagination from "@/hooks/usePagination";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

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

export default function CityAdminStaffPage() {
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
  } = usePagination();

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = useCallback(() => {
    setIsLoading(true);
    cityAdminService
      .getCityStaff()
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
    setTotalPages(Math.max(1, Math.ceil(staff.length / limit)));
  }, [staff.length, limit, setTotalPages]);

  const paginatedStaff = useMemo(() => {
    const start = (page - 1) * limit;
    return staff.slice(start, start + limit);
  }, [staff, page, limit]);

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-7">
      <div>
        <h1 className="text-2xl font-bold text-text">Staff</h1>
        <p className="mt-1 text-sm text-text-muted">
          View staff members assigned to your city.
        </p>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading staff..." />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<UserCircle size={30} weight="duotone" />}
          title="No staff found"
        />
      ) : (
        <div className="grid gap-5">
          {paginatedStaff.map((member) => (
            <div
              key={member._id}
              className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
            >
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
                    <p className="text-sm text-text-secondary">{member.email}</p>
                  </div>

                  <p className="text-sm text-text-secondary">{member.phone}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        STATUS_COLORS[member.status] || "bg-border text-text"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && staff.length > 0 && (
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
    </div>
  );
}
