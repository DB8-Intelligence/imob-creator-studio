/**
 * LeadsListView.tsx — Tabela de leads com ordenação e filtros
 */
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Download, Pencil, MessageCircle } from "lucide-react";
import {
  PIPELINE_COLUMNS,
  TEMPERATURA_CONFIG,
  FONTE_CONFIG,
  INTERESSE_LABEL,
  type Lead,
  type LeadStatus,
  type LeadFonte,
  type LeadTemperatura,
} from "@/types/lead";

interface LeadsListViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
}

type SortKey = "nome" | "valor_estimado" | "ultimo_contato" | "created_at";
type SortDir = "asc" | "desc";

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function LeadsListView({ leads, onEditLead }: LeadsListViewProps) {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [fonteFilter, setFonteFilter] = useState<LeadFonte | "all">("all");
  const [tempFilter, setTempFilter] = useState<LeadTemperatura | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...leads];
    if (statusFilter !== "all") result = result.filter((l) => l.status === statusFilter);
    if (fonteFilter !== "all") result = result.filter((l) => l.fonte === fonteFilter);
    if (tempFilter !== "all") result = result.filter((l) => l.temperatura === tempFilter);

    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [leads, statusFilter, fonteFilter, tempFilter, sortKey, sortDir]);

  const exportCsv = () => {
    const headers = ["Nome", "Telefone", "Email", "Status", "Interesse", "Imóvel", "Valor", "Fonte", "Temperatura", "Último Contato"];
    const rows = filtered.map((l) => [
      l.nome, l.telefone ?? "", l.email ?? "", l.status, l.interesse_tipo,
      l.imovel_interesse_nome ?? "", l.valor_estimado ?? "", l.fonte, l.temperatura, l.ultimo_contato ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort(field)}>
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {PIPELINE_COLUMNS.map((c) => <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={fonteFilter} onValueChange={(v) => setFonteFilter(v as LeadFonte | "all")}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Fonte" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fontes</SelectItem>
            {Object.entries(FONTE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={tempFilter} onValueChange={(v) => setTempFilter(v as LeadTemperatura | "all")}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Temperatura" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="quente">🔥 Quente</SelectItem>
            <SelectItem value="morno">☀️ Morno</SelectItem>
            <SelectItem value="frio">❄️ Frio</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportCsv}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs"><SortHeader label="Nome" field="nome" /></TableHead>
              <TableHead className="text-xs hidden md:table-cell">Status</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Interesse</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Imóvel</TableHead>
              <TableHead className="text-xs"><SortHeader label="Valor" field="valor_estimado" /></TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Fonte</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Temp.</TableHead>
              <TableHead className="text-xs"><SortHeader label="Contato" field="ultimo_contato" /></TableHead>
              <TableHead className="text-xs w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Nenhum lead encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((lead) => {
              const statusCol = PIPELINE_COLUMNS.find((c) => c.id === lead.status);
              const temp = TEMPERATURA_CONFIG[lead.temperatura];
              const fonte = FONTE_CONFIG[lead.fonte];

              return (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{lead.nome}</p>
                      <p className="text-[11px] text-muted-foreground">{lead.telefone ?? lead.email ?? "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-[10px]">
                      {statusCol?.emoji} {statusCol?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs">{INTERESSE_LABEL[lead.interesse_tipo]}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[150px]">
                    {lead.imovel_interesse_nome ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{formatCurrency(lead.valor_estimado)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className={`text-[10px] ${fonte.color}`}>{fonte.label}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${temp.color}`}>
                      {temp.emoji}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(lead.ultimo_contato)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {lead.telefone && (
                        <Button
                          size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500"
                          onClick={() => window.open(`https://wa.me/55${lead.telefone!.replace(/\D/g, "")}`, "_blank")}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEditLead(lead)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} lead{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
