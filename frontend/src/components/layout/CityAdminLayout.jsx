import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import CityAdminSidebar from "@/components/layout/CityAdminSideBar";

export default function CityAdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="mx-auto flex max-w-[1800px] gap-6 p-5">
        <div className="hidden shrink-0 sm:block">
          <CityAdminSidebar />
        </div>

        <div className="sm:hidden">
          <CityAdminSidebar />
        </div>

        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
