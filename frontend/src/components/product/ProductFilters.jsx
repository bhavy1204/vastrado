import { Funnel, X } from "@phosphor-icons/react";
import { PRODUCT_TYPES, GENDERS, SORT_OPTIONS } from "@/lib/constant";
import { formatProductType, capitalize } from "@/lib/formatters";

/**
 * ProductFilters
 *   <ProductFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
 *
 * filters shape: { type?: string, gender?: string, sort?: string }
 * Call resetPage() from usePagination alongside onChange in the parent.
 */
export default function ProductFilters({ filters, onChange, onReset }) {
  const hasActiveFilters = filters.type || filters.gender;

  const handleFieldChange = (field, value) => {
    onChange({ ...filters, [field]: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-text-secondary text-sm shrink-0">
        <Funnel size={16} />
        <span className="hidden sm:inline">Filter</span>
      </div>

      <FilterSelect
        value={filters.gender || ""}
        onChange={(v) => handleFieldChange("gender", v)}
        placeholder="Gender"
        options={GENDERS.map((g) => ({ value: g, label: capitalize(g) }))}
      />

      <FilterSelect
        value={filters.type || ""}
        onChange={(v) => handleFieldChange("type", v)}
        placeholder="Category"
        options={PRODUCT_TYPES.map((t) => ({ value: t, label: formatProductType(t) }))}
      />

      <FilterSelect
        value={filters.sort || ""}
        onChange={(v) => handleFieldChange("sort", v)}
        placeholder="Sort by"
        options={SORT_OPTIONS.map((s) => ({ value: s.value ?? s, label: s.label ?? capitalize(s) }))}
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-primary ml-auto sm:ml-0"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-border bg-surface-raised text-sm text-text px-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}


