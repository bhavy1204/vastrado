import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

// Route guards
import ProtectedRoute from "@/routes/protectedRoute.jsx";
import PublicOnlyRoute from "./routes/publicRoute.jsx";

// Layouts
import MainLayout from "@/components/layout/MainLayout.jsx";
import SellerLayout from "@/components/layout/SellerLayout.jsx";
import AdminLayout from "@/components/layout/AdminLayout.jsx";

// Top-level pages
import HomePage from "@/pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// User pages
import LoginPage from "@/pages/user/LoginPage.jsx";
import RegisterPage from "@/pages/user/RegisterPage.jsx";
import VerifyEmailPage from "@/pages/user/VerifyEmailPage.jsx";
import ForgotPasswordPage from "@/pages/user/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/pages/user/ResetPasswordPage.jsx";
import ProfilePage from "@/pages/user/ProfilePage.jsx";
import WishlistPage from "@/pages/user/WishlistPage.jsx";

// Product pages
import ProductListPage from "@/pages/poduct/ProductListPage.jsx";
import ProductDetailPage from "@/pages/poduct/ProductDetailPage.jsx";
import SearchResultsPage from "@/pages/poduct/SearchResultPage.jsx";
import NearbyPage from "@/pages/poduct/NearbyPage.jsx";

// Seller pages
import SellerRegisterPage from "@/pages/seller/RegisterPage.jsx";
import SellerDashboardPage from "@/pages/seller/DashboardPage.jsx";
import SellerProductsPage from "@/pages/seller/ProductsPage.jsx";
import SellerProfilePage from "@/pages/seller/ProfilePage.jsx";
import SellerSubscriptionPage from "@/pages/seller/SubscriptionPage.jsx";
import ShopPage from "@/pages/seller/ShopPage.jsx";

// Admin pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage.jsx";
import AdminSellersPage from "@/pages/admin/AdminSellerPage.jsx";
import AdminUsersPage from "@/pages/admin/AdminUsersPage.jsx";
import AdminBannersPage from "@/pages/admin/AdminBannerPage.jsx";
import AdminFAQsPage from "@/pages/admin/AdminFAQsPage.jsx";

// Temporary placeholder so App.jsx is functional before pages are built
const Placeholder = ({ name }) => (
  <div className="p-8 text-lg font-medium">{name}</div>
);

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public + user routes (Navbar + Footer) ─────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/shop/:slug" element={<ShopPage />} />
        <Route path="/nearby" element={<NearbyPage />} />

        {/* Protected — user */}
        <Route element={<ProtectedRoute allowedActors={["user"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>
      </Route>

      {/* ── Public-only auth routes (no Navbar — full-screen forms) ────── */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<PublicOnlyRoute actorType="seller" />}>
        <Route path="/seller/login" element={<LoginPage />} />
        <Route path="/seller/register" element={<SellerRegisterPage />} />
        <Route path="/seller/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/seller/forgot-password"
          element={<ForgotPasswordPage />}
        />
      </Route>

      {/* ── Protected — seller (Navbar + SellerSidebar) ────────────────── */}
      <Route element={<ProtectedRoute allowedActors={["seller"]} />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/profile" element={<SellerProfilePage />} />
          <Route
            path="/seller/subscription"
            element={<SellerSubscriptionPage />}
          />
        </Route>
      </Route>

      {/* ── Protected — admin (Navbar + AdminSidebar) ──────────────────── */}
      <Route element={<ProtectedRoute allowedActors={["user"]} requireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/sellers" element={<AdminSellersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/banners" element={<AdminBannersPage />} />
          <Route path="/admin/faqs" element={<AdminFAQsPage />} />
        </Route>
      </Route>

      {/* ── 404 ─────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
