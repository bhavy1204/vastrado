import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  UserCircle,
  Heart,
  Storefront,
  SignOut,
  SquaresFour,
  CaretDown,
} from "@phosphor-icons/react";
import useAuthStore from "@/store/useAuthStore";
import { userService } from "@/api/index";
import { sellerService } from "@/api/index";
import toast from "react-hot-toast";
import Input from "../common/Input.jsx";
import CitySelector from "../common/CitySelector.jsx";
import logo from "../../../assets/logo.png";

/**
 * Navbar
 * Logo (left) — Search (center/right) — Account icon (right)
 * Account dropdown branches on actorType: none | user | seller | admin
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { actorType, user, seller, clearAuth, isAdmin } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleLogout = async () => {
    try {
      if (actorType === "seller") {
        await sellerService.logout();
      } else {
        await userService.logout();
      }
    } catch {
      // clearAuth runs regardless — cookie may already be expired
    } finally {
      clearAuth();
      setIsMenuOpen(false);
      toast.success("Logged out");
      navigate("/");
    }
  };

 return (
   <header className="sticky top-0 z-40 w-full overflow-x-hidden bg-surface-raised border-b border-border">
     <div className="max-w-7xl mx-auto px-4 sm:px-6">
       <div className="flex items-center gap-4 h-16">
         <Link to="/" className="flex items-center gap-2 shrink-0">
           <img
             src={logo}
             alt="ClothMarket"
             className="h-12 w-12 rounded-full object-cover scale-110 ring-2 ring-primary/20 shadow-md transition-all duration-200 hover:scale-115 hover:ring-primary/40"
           />

           <span className="hidden sm:inline text-lg font-bold text-primary tracking-tight">
             ClothMarket
           </span>
         </Link>

         <form onSubmit={handleSearchSubmit} className="w-full min-w-0">
           <Input
             type="search"
             leftIcon={<MagnifyingGlass size={18} />}
             placeholder="Search products, shops..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </form>

         <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
           <CitySelector className="hidden sm:block sm:w-44" />

           <div className="relative" ref={menuRef}>
             <button
               type="button"
               onClick={() => setIsMenuOpen((prev) => !prev)}
               className="flex items-center gap-1 p-1.5 rounded-full hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
               aria-haspopup="menu"
               aria-expanded={isMenuOpen}
             >
               <UserCircle
                 size={30}
                 className="text-text-secondary sm:hidden"
                 weight={actorType ? "fill" : "regular"}
               />
               <UserCircle
                 size={26}
                 className="text-text-secondary hidden sm:block"
                 weight={actorType ? "fill" : "regular"}
               />
               <CaretDown
                 size={12}
                 className="text-text-muted hidden sm:block"
               />
             </button>

             {isMenuOpen && (
               <div
                 role="menu"
                 className="absolute right-0 mt-2 w-52 rounded-md bg-surface-raised border border-border shadow-lg py-1"
               >
                 {!actorType && (
                   <Link
                     to="/login"
                     role="menuitem"
                     onClick={() => setIsMenuOpen(false)}
                     className="block px-4 py-2 text-sm text-text hover:bg-surface"
                   >
                     Log in
                   </Link>
                 )}

                 {actorType === "user" && !isAdmin() && (
                   <>
                     <MenuLink
                       to="/profile"
                       icon={<UserCircle size={16} />}
                       onClick={() => setIsMenuOpen(false)}
                     >
                       Profile
                     </MenuLink>
                     <MenuLink
                       to="/wishlist"
                       icon={<Heart size={16} />}
                       onClick={() => setIsMenuOpen(false)}
                     >
                       Wishlist
                     </MenuLink>
                     <button
                       onClick={handleLogout}
                       role="menuitem"
                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-surface"
                     >
                       <SignOut size={16} /> Log out
                     </button>
                   </>
                 )}

                 {actorType === "seller" && (
                   <>
                     <MenuLink
                       to="/seller/profile"
                       icon={<Storefront size={16} />}
                       onClick={() => setIsMenuOpen(false)}
                     >
                       My shop
                     </MenuLink>
                     <button
                       onClick={handleLogout}
                       role="menuitem"
                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-surface"
                     >
                       <SignOut size={16} /> Log out
                     </button>
                   </>
                 )}

                 {actorType === "user" && isAdmin() && (
                   <>
                     <MenuLink
                       to="/admin/dashboard"
                       icon={<SquaresFour size={16} />}
                       onClick={() => setIsMenuOpen(false)}
                     >
                       Admin dashboard
                     </MenuLink>
                     <button
                       onClick={handleLogout}
                       role="menuitem"
                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-surface"
                     >
                       <SignOut size={16} /> Log out
                     </button>
                   </>
                 )}
               </div>
             )}
           </div>
         </div>
       </div>

       <div className="sm:hidden pb-2">
         <CitySelector className="w-full" />
       </div>
     </div>
   </header>
 );
}

function MenuLink({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface"
    >
      {icon} {children}
    </Link>
  );
}
