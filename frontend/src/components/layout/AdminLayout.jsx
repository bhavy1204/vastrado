import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Mobile Sidebar — horizontal scroll strip below navbar */}
      <div className="border-b border-border bg-surface-raised sm:hidden">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-2">
          <AdminSidebar variant="horizontal" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1800px] gap-6 p-4 sm:p-5">
        {/* Sidebar — desktop only */}
        <div className="hidden shrink-0 sm:block">
          <AdminSidebar variant="vertical" />
        </div>

        {/* Page Content */}
        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
