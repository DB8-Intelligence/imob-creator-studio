import { Button } from "@/components/ui/button";
import type { PropertyStatus } from "./StatusBadge";

export interface FilterOption {
  label: string;
  value: PropertyStatus | "all";
}

const defaultFilters: FilterOption[] = [
  { label: "Todos",      value: "all" },
  { label: "Novos",      value: "new" },
  { label: "Em edição",  value: "processing" },
  { label: "Prontos",    value: "ready" },
  { label: "Aprovados",  value: "approved" },
  { label: "Publicados", value: "published" },
  { label: "Erros",      value: "error" },
];

interface FiltersBarProps {
  active: PropertyStatus | "all";
  onChange: (value: PropertyStatus | "all") => void;
  filters?: FilterOption[];
}

const FiltersBar = ({ active, onChange, filters = defaultFilters }: FiltersBarProps) => (
  <div className="flex gap-2 flex-wrap">
    {filters.map((f) => (
      <Button
        key={f.value}
        variant={active === f.value ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(f.value)}
        className="rounded-full"
      >
        {f.label}
      </Button>
    ))}
  </div>
);

export default FiltersBar;
