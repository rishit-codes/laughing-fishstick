import { Search, ListFilter, ArrowUpDown, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  search: string;
  onSearchChange: (s: string) => void;
  placeholder?: string;
  groupBy?: string;
  onGroupByChange?: (s: string) => void;
  groupOptions?: string[];
  filter?: string;
  onFilterChange?: (s: string) => void;
  filterOptions?: string[];
  sortBy?: string;
  onSortByChange?: (s: string) => void;
  sortOptions?: string[];
  right?: React.ReactNode;
};

export function Toolbar({
  search,
  onSearchChange,
  placeholder = "Search…",
  groupBy,
  onGroupByChange,
  groupOptions,
  filter,
  onFilterChange,
  filterOptions,
  sortBy,
  onSortByChange,
  sortOptions,
  right,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-xl border-transparent bg-background pl-9 pr-3 focus-visible:border-border"
        />
      </div>
      {groupOptions && (
        <SelectChip
          icon={LayoutGrid}
          label="Group by"
          value={groupBy ?? groupOptions[0]}
          options={groupOptions}
          onChange={(v) => onGroupByChange?.(v)}
        />
      )}
      {filterOptions && (
        <SelectChip
          icon={ListFilter}
          label="Filter"
          value={filter ?? filterOptions[0]}
          options={filterOptions}
          onChange={(v) => onFilterChange?.(v)}
        />
      )}
      {sortOptions && (
        <SelectChip
          icon={ArrowUpDown}
          label="Sort"
          value={sortBy ?? sortOptions[0]}
          options={sortOptions}
          onChange={(v) => onSortByChange?.(v)}
        />
      )}
      {right}
    </div>
  );
}

function SelectChip({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: typeof Search;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="group inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm transition hover:border-foreground/30">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent pr-1 text-sm font-medium outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
