import { useEffect, useState } from "react";
import { MapPin } from "@phosphor-icons/react";
import { adminService } from "@/api/index";
import useCityStore from "@/store/useCityStore";

/**
 * Reusable city picker backed by useCityStore.
 * Fetches active cities, restores the saved selection, and falls back
 * to the first city when nothing is stored yet.
 */
export default function CitySelector({ className = "", label }) {
  const selectedCity = useCityStore((s) => s.selectedCity);
  const setSelectedCity = useCityStore((s) => s.setSelectedCity);
  const loadSelectedCity = useCityStore((s) => s.loadSelectedCity);

  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSelectedCity();

    adminService
      .getAllActiveCities()
      .then((res) => {
        const activeCities = res.data?.data ?? [];
        setCities(activeCities);

        if (activeCities.length === 0) return;

        const stored = useCityStore.getState().selectedCity;
        const matched = stored
          ? activeCities.find((city) => city._id === stored._id)
          : null;

        setSelectedCity(matched ?? activeCities[0]);
      })
      .catch(() => {
        setCities([]);
      })
      .finally(() => setIsLoading(false));
  }, [loadSelectedCity, setSelectedCity]);

  const handleChange = (e) => {
    const city = cities.find((c) => c._id === e.target.value);
    if (city) setSelectedCity(city);
  };

  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}

      <div
        className={[
          "flex h-10 overflow-hidden rounded-lg border border-border bg-surface-raised transition-colors sm:h-11",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        ].join(" ")}
      >
        <div className="flex w-10 shrink-0 items-center justify-center border-r border-border text-text-muted sm:w-11">
          <MapPin size={16} className="sm:hidden" />
          <MapPin size={18} className="hidden sm:block" />
        </div>

        <select
          value={selectedCity?._id ?? ""}
          onChange={handleChange}
          disabled={isLoading || cities.length === 0}
          aria-label={label || "Select city"}
          className={[
            "flex-1 bg-transparent px-2.5 text-xs capitalize text-text outline-none sm:px-3 sm:text-sm",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {isLoading ? (
            <option value="">Loading cities...</option>
          ) : cities.length === 0 ? (
            <option value="">No cities available</option>
          ) : (
            cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
