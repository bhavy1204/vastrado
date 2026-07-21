import { create } from "zustand";

const STORAGE_KEY = "selectedCity";

const useCityStore = create((set) => ({
    selectedCity: null,

    setSelectedCity: (city) => {
        set({ selectedCity: city });

        if (city) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    },

    loadSelectedCity: () => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return;

        try {
            set({
                selectedCity: JSON.parse(stored),
            });
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    },

    clearSelectedCity: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ selectedCity: null });
    },
}));

export default useCityStore;

