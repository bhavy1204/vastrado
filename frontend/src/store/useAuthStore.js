import { create } from "zustand";
import { userService, sellerService, staffService } from "../api/index.js";

const initialState = {
    actorType: null,
    user: null,
    seller: null,
    staff: null,
    isLoading: true,
};

// store

const useAuthStore = create((set, get) => ({

    ...initialState,

    // Usage: const isAuthenticated = useAuthStore(s => s.isAuthenticated())
    isAuthenticated: () => {
        const { user, seller, staff } = get();
        return !!(user || seller || staff);
    },

    isAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
    },

    // after user login
    setUser: (userData) => {
        set({
            actorType: "user",
            user: userData,
            seller: null,
            staff: null,
            isLoading: false,
        });

        localStorage.setItem("actorType", "user");
        localStorage.setItem("userRole", userData.role ?? "user");
    },

    // after seller login
    setSeller: (sellerData) => {
        set({
            actorType: "seller",
            seller: sellerData,
            user: null,
            staff: null,
            isLoading: false,
        });

        localStorage.setItem("actorType", "seller");
        localStorage.removeItem("userRole");
    },

    // after staff login
    setStaff: (staffData) => {
        set({
            actorType: "staff",
            staff: staffData,
            user: null,
            seller: null,
            isLoading: false,
        });

        localStorage.setItem("actorType", "staff");
        localStorage.removeItem("userRole");
    },

    clearAuth: () => {
        set({
            ...initialState,
            isLoading: false,
        });

        localStorage.removeItem("actorType");
        localStorage.removeItem("userRole");
    },

    // checkAuth

    // Called ONCE on app mount (in App.jsx or a top-level component).
    //
    // Problem it solves:
    //   Zustand state is in-memory — it resets on every page refresh.
    //   But httpOnly cookies persist. So after a refresh, the user IS still
    //   authenticated (cookie is valid) but Zustand thinks they're logged out.
    //   Without this, every refresh would kick users to /login.

    checkAuth: async () => {
        set({ isLoading: true });

        const actorType = localStorage.getItem("actorType");

        if (!actorType) {
            set({ ...initialState, isLoading: false });
            return;
        }

        try {
            if (actorType === "seller") {

                const res = await sellerService.getDashboard();

                set({
                    actorType: "seller",
                    seller: res.data.data,
                    user: null,
                    staff: null,
                    isLoading: false,
                });

            } else if (actorType === "staff") {

                const res = await staffService.getProfile();

                set({
                    actorType: "staff",
                    staff: res.data.data,
                    user: null,
                    seller: null,
                    isLoading: false,
                });

            } else {

                const res = await userService.getProfile();

                set({
                    actorType: "user",
                    user: res.data.data,
                    seller: null,
                    staff: null,
                    isLoading: false,
                });

            }
        } catch {
            // cookies expired or invalid, but interceptors will handle so need here

            set({ ...initialState, isLoading: false });

            localStorage.removeItem("actorType");
            localStorage.removeItem("userRole");
        }
    },

    // called after any updation
    updateUserState: (fields) =>
        set((state) => ({
            user: state.user ? { ...state.user, ...fields } : state.user,
        })),

    updateSellerState: (fields) =>
        set((state) => ({
            seller: state.seller ? { ...state.seller, ...fields } : state.seller,
        })),

    updateStaffState: (fields) =>
        set((state) => ({
            staff: state.staff ? { ...state.staff, ...fields } : state.staff,
        })),
}));

export default useAuthStore;

