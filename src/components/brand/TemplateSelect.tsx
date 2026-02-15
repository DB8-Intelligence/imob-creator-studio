import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrandTemplates } from "@/hooks/useBrandTemplates";
import { Loader2 } from "lucide-react";

interface TemplateSelectProps {
  value?: string;
  onChange: (templateId: string) => void;
}

const TemplateSelect = ({ value, onChange }: TemplateSelectProps) => {
  const { data: templates, isLoading } = useBrandTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando templates...
      </div>
    );
  }

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um template" />
      </SelectTrigger>
      <SelectContent>
        {templates?.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            <div className="flex items-center gap-2">
              {t.logo_url && (
                <img src={t.logo_url} alt="" className="w-4 h-4 object-contain rounded" />
              )}
              <span>{t.name}</span>
              <div className="flex gap-1 ml-1">
                <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: t.primary_color }} />
                <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: t.secondary_color }} />
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TemplateSelect;
