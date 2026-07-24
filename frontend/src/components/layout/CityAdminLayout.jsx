import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import CityAdminSidebar from "@/components/layout/CityAdminSideBar";

export default function CityAdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      {/* <Navbar /> */}

      <div className="mx-auto flex max-w-[1800px] flex-col gap-6 p-4 sm:flex-row sm:p-5">
        <div className="shrink-0">
          <CityAdminSidebar />
        </div>

        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
