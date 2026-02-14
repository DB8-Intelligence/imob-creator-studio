import { Button } from "@/components/ui/button";
import type { PropertyStatus } from "./StatusBadge";

const filters: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Em edição", value: "editing" },
  { label: "Aprovados", value: "approved" },
  { label: "Publicados", value: "published" },
  { label: "Erros", value: "error" },
];

interface FiltersBarProps {
  active: PropertyStatus | "all";
  onChange: (value: PropertyStatus | "all") => void;
}

const FiltersBar = ({ active, onChange }: FiltersBarProps) => (
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
