/**
 * ImportarLeadsPage.tsx — CSV import for leads
 * Route: /dashboard/crm/importar
 */
import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// ── Types ────────────────────────────────────────────────────────────────────

type MappableField = "nome" | "email" | "telefone" | "fonte" | "__skip__";

const MAPPABLE_FIELDS: { value: MappableField; label: string }[] = [
  { value: "nome", label: "Nome" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "fonte", label: "Fonte" },
  { value: "__skip__", label: "(Ignorar)" },
];

type ImportState = "idle" | "preview" | "importing" | "done";

interface ImportResult {
  total: number;
  success: number;
  errors: number;
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  return lines.map((line) => {
    // Simple CSV split — handles basic comma-separated values
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else if (char === ";" && !inQuotes) {
        // Also support semicolon delimiter (common in Brazilian CSVs)
        cols.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    return cols;
  });
}

function autoDetectMapping(headers: string[]): MappableField[] {
  return headers.map((h) => {
    const lower = h.toLowerCase().trim();
    if (lower.includes("nome") || lower.includes("name")) return "nome";
    if (lower.includes("email") || lower.includes("e-mail")) return "email";
    if (lower.includes("telefone") || lower.includes("phone") || lower.includes("whatsapp") || lower.includes("celular"))
      return "telefone";
    if (lower.includes("fonte") || lower.includes("source") || lower.includes("origem"))
      return "fonte";
    return "__skip__";
  });
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ImportarLeadsPage() {
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ImportState>("idle");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MappableField[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Formato invalido",
        description: "Apenas arquivos .csv sao aceitos.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo CSV precisa ter ao menos 1 linha de dados.",
          variant: "destructive",
        });
        return;
      }

      const [headerRow, ...dataRows] = parsed;
      setHeaders(headerRow);
      setRows(dataRows);
      setMapping(autoDetectMapping(headerRow));
      setState("preview");
    };
    reader.readAsText(file, "UTF-8");
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Column mapping update ──────────────────────────────────────────────────

  const updateMapping = (index: number, value: MappableField) => {
    setMapping((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    const nomeIdx = mapping.indexOf("nome");
    if (nomeIdx === -1) {
      toast({
        title: "Mapeamento incompleto",
        description: "Voce precisa mapear ao menos a coluna 'Nome'.",
        variant: "destructive",
      });
      return;
    }

    setState("importing");
    setProgress(0);

    let success = 0;
    let errors = 0;
    const total = rows.length;
    const BATCH_SIZE = 25;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const inserts = batch
        .map((row) => {
          const nome = row[nomeIdx]?.trim();
          if (!nome) return null;

          const emailIdx = mapping.indexOf("email");
          const telefoneIdx = mapping.indexOf("telefone");
          const fonteIdx = mapping.indexOf("fonte");

          return {
            workspace_id: workspaceId,
            name: nome,
            email: emailIdx >= 0 ? row[emailIdx]?.trim() || null : null,
            phone: telefoneIdx >= 0 ? row[telefoneIdx]?.trim() || null : null,
            source: fonteIdx >= 0 ? row[fonteIdx]?.trim() || "outro" : "outro",
            status: "novo",
            interesse_tipo: "compra",
            temperatura: "morno",
          };
        })
        .filter(Boolean);

      if (inserts.length > 0) {
        const { error } = await supabase
          .from("leads")
          .insert(inserts as Record<string, unknown>[]);

        if (error) {
          errors += inserts.length;
        } else {
          success += inserts.length;
        }
      } else {
        errors += batch.length;
      }

      setProgress(Math.min(Math.round(((i + batch.length) / total) * 100), 100));
    }

    setResult({ total, success, errors });
    setState("done");
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetAll = () => {
    setState("idle");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping([]);
    setProgress(0);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Preview rows (max 5) ──────────────────────────────────────────────────

  const previewRows = rows.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6 font-['Plus_Jakarta_Sans'] max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#002B5B]">Importar Leads</h1>
          <p className="text-sm text-gray-500">
            Importe seus leads a partir de um arquivo CSV
          </p>
        </div>

        {/* ── STATE: idle — Upload area ─────────────────────────────────────── */}
        {state === "idle" && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-colors m-4"
              >
                <Upload className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-[#002B5B] mb-1">
                  Arraste seu arquivo CSV aqui
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  ou clique para selecionar
                </p>
                <Badge variant="secondary" className="text-xs">
                  Apenas .csv
                </Badge>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STATE: preview — Column mapping + preview table ───────────────── */}
        {state === "preview" && (
          <>
            {/* File info */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <FileSpreadsheet className="w-8 h-8 text-[#002B5B]" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#002B5B]">{fileName}</p>
                  <p className="text-xs text-gray-400">
                    {rows.length} linha{rows.length !== 1 ? "s" : ""} de dados encontrada{rows.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetAll}>
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Column mapping */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#002B5B] text-base">
                  Mapeamento de colunas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {headers.map((header, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {header}
                      </p>
                      <Select
                        value={mapping[idx]}
                        onValueChange={(v) => updateMapping(idx, v as MappableField)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAPPABLE_FIELDS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview table */}
            <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#002B5B] text-sm">
                  Preview (primeiras {previewRows.length} linhas)
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/60">
                      {headers.map((h, i) => (
                        <TableHead key={i} className="text-xs text-[#002B5B] font-semibold whitespace-nowrap">
                          {h}
                          {mapping[i] !== "__skip__" && (
                            <Badge variant="secondary" className="ml-1 text-[9px]">
                              {mapping[i]}
                            </Badge>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, ri) => (
                      <TableRow key={ri}>
                        {row.map((cell, ci) => (
                          <TableCell
                            key={ci}
                            className={`text-sm whitespace-nowrap ${
                              mapping[ci] === "__skip__" ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {cell || "--"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Action */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={resetAll}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
              >
                Importar {rows.length} lead{rows.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </>
        )}

        {/* ── STATE: importing — Progress ───────────────────────────────────── */}
        {state === "importing" && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="flex flex-col items-center py-16 space-y-4">
              <div className="w-12 h-12 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold text-[#002B5B]">Importando...</p>
              <div className="w-full max-w-sm space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-400 text-center">{progress}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STATE: done — Results ─────────────────────────────────────────── */}
        {state === "done" && result && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="flex flex-col items-center py-16 space-y-4">
              {result.errors === 0 ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-amber-500" />
              )}
              <h3 className="text-lg font-bold text-[#002B5B]">
                Importacao concluida
              </h3>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{result.success}</p>
                  <p className="text-xs text-gray-400">importados</p>
                </div>
                {result.errors > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-red-500">{result.errors}</p>
                    <p className="text-xs text-gray-400">erros</p>
                  </div>
                )}
              </div>
              <Button
                onClick={resetAll}
                className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white mt-4"
              >
                Importar outro arquivo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
