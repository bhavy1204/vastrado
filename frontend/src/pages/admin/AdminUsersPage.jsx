import { useEffect, useState, useCallback } from "react";
import { Users, Trash } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api/index";
import usePagination from "@/hooks/usePagination";
import useDebounce from "@/hooks/useDebounce";
import { formatDate } from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
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
          users: res.data.data,
          totalPages: 1,
        }))
      : adminService.getAllUsers(params).then((res) => ({
          users: res.data.data.users,
          totalPages: res.data.data.pagination.totalPages,
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
   <div className="flex flex-col gap-6 p-5 sm:p-7">
     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
       <div>
         <h1 className="text-2xl font-bold text-text">User Management</h1>
         <p className="mt-1 text-sm text-text-muted">
           View and manage registered users.
         </p>
       </div>

       <input
         type="search"
         value={searchInput}
         onChange={(e) => setSearchInput(e.target.value)}
         placeholder="Search by exact email..."
         className="h-11 w-full md:w-80 rounded-lg border border-border bg-surface-raised px-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
       />
     </div>

     {isLoading ? (
       <Loader className="py-16" label="Loading users..." />
     ) : users.length === 0 ? (
       <EmptyState
         icon={<Users size={30} weight="duotone" />}
         title="No users found"
       />
     ) : (
       <div className="grid gap-5">
         {users.map((user) => (
           <div
             key={user._id}
             className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
           >
             <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
               {/* Left */}
               <div className="flex items-start gap-4">
                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                   {user.fullName?.charAt(0)?.toUpperCase()}
                 </div>

                 <div className="space-y-2">
                   <div>
                     <h2 className="text-lg font-semibold text-text">
                       {user.fullName}
                     </h2>

                     <p className="text-sm text-text-secondary">{user.email}</p>
                   </div>

                   <p className="text-sm text-text-muted">
                     Joined {formatDate(user.createdAt)}
                   </p>
                 </div>
               </div>

               {/* Right */}
               <div className="flex items-center gap-3">
                 <Button
                   variant="danger"
                   leftIcon={<Trash size={16} />}
                   isLoading={deletingId === user._id}
                   onClick={() => handleDelete(user)}
                 >
                   Delete User
                 </Button>
               </div>
             </div>
           </div>
         ))}
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


