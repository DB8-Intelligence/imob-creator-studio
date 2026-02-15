import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit3, Trash2, Loader2 } from "lucide-react";
import type { BrandTemplate } from "@/types/brandTemplate";

interface TemplateTableProps {
  templates: BrandTemplate[];
  onEdit: (t: BrandTemplate) => void;
  onDelete: (id: string) => void;
  isDeletingId: string | null;
}

const TemplateTable = ({ templates, onEdit, onDelete, isDeletingId }: TemplateTableProps) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden sm:table-cell">Preview</TableHead>
          <TableHead className="hidden md:table-cell">Cores</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="font-medium">{t.name}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="relative w-16 h-16 rounded border border-border overflow-hidden bg-muted">
                {t.frame_url && (
                  <img src={t.frame_url} alt="Frame" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {t.logo_url && (
                  <img
                    src={t.logo_url}
                    alt="Logo"
                    className={`absolute w-5 h-5 object-contain ${
                      t.logo_position === "top-left" ? "top-0.5 left-0.5" :
                      t.logo_position === "top-right" ? "top-0.5 right-0.5" :
                      t.logo_position === "bottom-left" ? "bottom-0.5 left-0.5" :
                      "bottom-0.5 right-0.5"
                    }`}
                  />
                )}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: t.primary_color }} />
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: t.secondary_color }} />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={isDeletingId === t.id}
                  onClick={() => onDelete(t.id)}
                >
                  {isDeletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default TemplateTable;
