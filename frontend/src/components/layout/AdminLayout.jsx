import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="mx-auto flex max-w-[1800px] gap-6 p-5">
        {/* Sidebar */}
        <div className="hidden shrink-0 sm:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <div className="sm:hidden">
          <AdminSidebar />
        </div>

        {/* Page Content */}
        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
