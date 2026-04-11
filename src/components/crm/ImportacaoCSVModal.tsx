/**
 * ImportacaoCSVModal.tsx — 3-step CSV import dialog for leads
 * Step 1: Upload + download template
 * Step 2: Preview + column mapping + duplicate warning
 * Step 3: Progress bar + results
 */
import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ImportacaoCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;

const CSV_TEMPLATE_FIELDS = [
  "nome", "telefone", "email", "origem", "interesse", "temperatura",
  "imovel_interesse", "valor_estimado", "observacoes",
];

const LEAD_FIELDS = [
  { value: "skip", label: "Ignorar" },
  { value: "nome", label: "Nome" },
  { value: "telefone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "origem", label: "Origem" },
  { value: "interesse", label: "Interesse" },
  { value: "temperatura", label: "Temperatura" },
  { value: "imovel_interesse", label: "Imovel interesse" },
  { value: "valor_estimado", label: "Valor estimado" },
  { value: "observacoes", label: "Observacoes" },
];

const ORIGIN_MAP: Record<string, string> = {
  instagram: "instagram",
  whatsapp: "whatsapp",
  site: "site",
  indicacao: "indicacao",
  indicação: "indicacao",
};

const INTERESSE_MAP: Record<string, string> = {
  compra: "compra",
  aluguel: "aluguel",
  lancamento: "lancamento",
  lançamento: "lancamento",
};

const TEMP_MAP: Record<string, string> = {
  quente: "quente",
  morno: "morno",
  frio: "frio",
};

const ImportacaoCSVModal: React.FC<ImportacaoCSVModalProps> = ({ open, onOpenChange }) => {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Step 3 state
  const [progress, setProgress] = useState(0);
  const [resultCreated, setResultCreated] = useState(0);
  const [resultErrors, setResultErrors] = useState(0);
  const [importing, setImporting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1);
    setRows([]);
    setHeaders([]);
    setMapping({});
    setDuplicateCount(0);
    setProgress(0);
    setResultCreated(0);
    setResultErrors(0);
    setImporting(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const downloadTemplate = () => {
    const csv = CSV_TEMPLATE_FIELDS.join(",") + "\nJoao Silva,(11) 99999-9999,joao@email.com,instagram,compra,quente,Apt 3q Centro,500000,Interessado em 3 quartos";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data as Record<string, string>[];
        if (parsed.length === 0) {
          toast({ title: "Arquivo vazio", variant: "destructive" });
          return;
        }
        const hdrs = Object.keys(parsed[0]);
        setHeaders(hdrs);
        setRows(parsed);

        // Auto-map columns by name similarity
        const autoMap: Record<string, string> = {};
        hdrs.forEach((h) => {
          const lower = h.toLowerCase().trim();
          const match = LEAD_FIELDS.find(
            (f) => f.value !== "skip" && (lower === f.value || lower.includes(f.value) || f.value.includes(lower))
          );
          autoMap[h] = match ? match.value : "skip";
        });
        setMapping(autoMap);

        // Check duplicates by phone/email
        const phones = parsed.map((r) => {
          const phoneCol = hdrs.find((h) => autoMap[h] === "telefone");
          return phoneCol ? r[phoneCol]?.replace(/\D/g, "") : "";
        }).filter(Boolean);
        const uniquePhones = new Set(phones);
        setDuplicateCount(phones.length - uniquePhones.size);

        setStep(2);
      },
      error: () => {
        toast({ title: "Erro ao ler arquivo CSV", variant: "destructive" });
      },
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    setProgress(0);
    setResultCreated(0);
    setResultErrors(0);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";

    // Build lead rows from mapping
    const leadsToInsert = rows.map((row) => {
      const mapped: Record<string, string> = {};
      Object.entries(mapping).forEach(([csvCol, field]) => {
        if (field !== "skip") {
          mapped[field] = row[csvCol] ?? "";
        }
      });

      return {
        workspace_id: workspaceId,
        name: mapped.nome || "Sem nome",
        phone: mapped.telefone || null,
        email: mapped.email || null,
        source: ORIGIN_MAP[(mapped.origem || "").toLowerCase()] || "outro",
        interesse_tipo: INTERESSE_MAP[(mapped.interesse || "").toLowerCase()] || "compra",
        temperatura: TEMP_MAP[(mapped.temperatura || "").toLowerCase()] || "morno",
        imovel_interesse_nome: mapped.imovel_interesse || null,
        valor_estimado: mapped.valor_estimado ? Number(mapped.valor_estimado.replace(/\D/g, "")) || null : null,
        notas: mapped.observacoes || null,
        status: "novo",
        assigned_to: userId,
      };
    });

    // Insert in batches of 50
    const batchSize = 50;
    let created = 0;
    let errors = 0;

    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize);
      const { error } = await supabase.from("leads").insert(batch);
      if (error) {
        errors += batch.length;
      } else {
        created += batch.length;
      }
      setProgress(Math.round(((i + batch.length) / leadsToInsert.length) * 100));
      setResultCreated(created);
      setResultErrors(errors);
    }

    setProgress(100);
    setImporting(false);
    qc.invalidateQueries({ queryKey: ["leads", workspaceId] });
    toast({ title: `Importacao concluida: ${created} leads criados` });
  };

  const previewRows = rows.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            Importar Leads via CSV
            <Badge variant="secondary" className="ml-2">Passo {step}/3</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* ─── Step 1: Upload ─── */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Arraste seu arquivo CSV aqui</p>
              <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
            <Button variant="outline" className="w-full" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Baixar modelo CSV
            </Button>
          </div>
        )}

        {/* ─── Step 2: Preview + Mapping ─── */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4 inline mr-1" />
                {rows.length} linhas encontradas
              </p>
              {duplicateCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" /> {duplicateCount} possiveis duplicatas
                </Badge>
              )}
            </div>

            {/* Column mapping */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Mapeamento de colunas</p>
              <div className="grid grid-cols-2 gap-2">
                {headers.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate w-24" title={h}>{h}</span>
                    <Select value={mapping[h] || "skip"} onValueChange={(v) => setMapping((p) => ({ ...p, [h]: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h} className="text-xs whitespace-nowrap">{row[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={handleImport}>Importar {rows.length} leads</Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Progress + Results ─── */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-center text-muted-foreground">
              {importing ? `Importando... ${progress}%` : "Importacao finalizada!"}
            </p>

            {!importing && (
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-4 text-center">
                  <CheckCircle className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
                  <p className="text-2xl font-bold text-emerald-600">{resultCreated}</p>
                  <p className="text-xs text-muted-foreground">Leads criados</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <AlertCircle className="h-6 w-6 mx-auto text-red-500 mb-1" />
                  <p className="text-2xl font-bold text-red-500">{resultErrors}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
            )}

            {!importing && (
              <div className="flex justify-end">
                <Button onClick={() => handleClose(false)}>Fechar</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportacaoCSVModal;
