import { useEffect, useState, useCallback } from "react";
import { Users, Trash } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api";
import usePagination from "@/hooks/usePagination";
import useDebounce from "@/hooks/useDebounce";
import { formatDate } from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

/**
 * Admin UsersPage — /admin/users
 * Search input tries getUserByEmail for an exact match when it looks like
 * an email; otherwise falls back to the paginated getAllUsers list.
 * Deletion is a hard delete per your architecture decision — the confirm
 * dialog says so explicitly since it can't be undone.
 */
export default function AdminUsersPage() {
  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage, resetPage } =
    usePagination();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const isEmailSearch = debouncedSearch.includes("@");

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = useCallback(() => {
    setIsLoading(true);

    const request = isEmailSearch
      ? adminService.getUserByEmail(debouncedSearch).then((res) => ({
          users: res.data ? [res.data] : [],
          totalPages: 1,
        }))
      : adminService.getAllUsers(params).then((res) => ({
          users: res.data?.users || res.data || [],
          totalPages: res.data?.totalPages || 1,
        }));

    request
      .then(({ users, totalPages }) => {
        setUsers(users);
        setTotalPages(totalPages);
      })
      .catch((err) => {
        if (isEmailSearch && err?.response?.status === 404) {
          setUsers([]);
          setTotalPages(1);
        } else {
          toast.error(err?.response?.data?.message || "Couldn't load users");
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.fullName || user.email}? This cannot be undone.`)) return;
    setDeletingId(user._id);
    try {
      await adminService.deleteUser(user._id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete this user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-text">Users</h1>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by exact email..."
          className="h-9 w-64 max-w-full rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={26} weight="duotone" />} title="No users found" />
      ) : (
        <div className="rounded-md border border-border bg-surface-raised overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-text">{user.fullName}</td>
                  <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user._id}
                      aria-label="Delete user"
                      className="text-text-muted hover:text-error p-1.5 disabled:opacity-50"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isEmailSearch && (
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


