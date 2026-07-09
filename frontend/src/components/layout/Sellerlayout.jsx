import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import SellerSidebar from "@/components/layout/SellerSidebar";

export default function SellerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col sm:flex-row">
        <SellerSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


