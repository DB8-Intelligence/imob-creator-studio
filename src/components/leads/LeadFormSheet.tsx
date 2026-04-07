/**
 * LeadFormSheet.tsx — Drawer lateral para criar / editar lead
 *
 * Seções:
 * 1. Dados Pessoais — nome, telefone (máscara BR), email
 * 2. Interesse — tipo, imóvel (busca), faixa valor, bairros, observações
 * 3. Origem — fonte, campanha, corretor
 * 4. Temperatura — toggle visual ❄️→☀️→🔥
 * 5. Notas — histórico append-only
 *
 * Ações: Salvar / Salvar e Agendar / WhatsApp
 */
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageCircle, CalendarPlus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Lead,
  CreateLeadInput,
  LeadInteresse,
  LeadFonte,
  LeadTemperatura,
} from "@/types/lead";

interface LeadFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSubmit: (data: CreateLeadInput) => void;
  onSubmitAndSchedule?: (data: CreateLeadInput) => void;
  isSubmitting?: boolean;
}

// ─── Máscara telefone BR ───────────────────────────────────────────────────
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ─── Temperatura toggle ────────────────────────────────────────────────────
const TEMP_OPTIONS: { id: LeadTemperatura; emoji: string; label: string; color: string; activeColor: string }[] = [
  { id: "frio",   emoji: "❄️", label: "Frio",   color: "border-blue-300/30 text-blue-400",   activeColor: "border-blue-400 bg-blue-500/15 text-blue-500 ring-1 ring-blue-400" },
  { id: "morno",  emoji: "☀️", label: "Morno",  color: "border-amber-300/30 text-amber-400", activeColor: "border-amber-400 bg-amber-500/15 text-amber-500 ring-1 ring-amber-400" },
  { id: "quente", emoji: "🔥", label: "Quente", color: "border-red-300/30 text-red-400",     activeColor: "border-red-400 bg-red-500/15 text-red-500 ring-1 ring-red-400" },
];

export function LeadFormSheet({
  open,
  onOpenChange,
  lead,
  onSubmit,
  onSubmitAndSchedule,
  isSubmitting,
}: LeadFormSheetProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [interesseTipo, setInteresseTipo] = useState<LeadInteresse>("compra");
  const [imovelNome, setImovelNome] = useState("");
  const [valorDe, setValorDe] = useState("");
  const [valorAte, setValorAte] = useState("");
  const [bairros, setBairros] = useState<string[]>([]);
  const [bairroInput, setBairroInput] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fonte, setFonte] = useState<LeadFonte>("whatsapp");
  const [campanha, setCampanha] = useState("");
  const [corretorResponsavel, setCorretorResponsavel] = useState("");
  const [temperatura, setTemperatura] = useState<LeadTemperatura>("morno");
  const [novaNota, setNovaNota] = useState("");
  const [historicoNotas, setHistoricoNotas] = useState<string[]>([]);

  // ── Populate on edit ──────────────────────────────────────────────────
  useEffect(() => {
    if (lead) {
      setNome(lead.nome);
      setTelefone(lead.telefone ?? "");
      setEmail(lead.email ?? "");
      setInteresseTipo(lead.interesse_tipo);
      setImovelNome(lead.imovel_interesse_nome ?? "");
      setValorDe(lead.valor_estimado ? String(lead.valor_estimado) : "");
      setValorAte("");
      setBairros([]);
      setObservacoes("");
      setFonte(lead.fonte);
      setCampanha("");
      setCorretorResponsavel(lead.corretor_responsavel ?? "");
      setTemperatura(lead.temperatura);
      setNovaNota("");
      // Parse existing notes as history
      setHistoricoNotas(lead.notas ? lead.notas.split("\n---\n") : []);
    } else {
      setNome(""); setTelefone(""); setEmail(""); setInteresseTipo("compra");
      setImovelNome(""); setValorDe(""); setValorAte(""); setBairros([]);
      setObservacoes(""); setFonte("whatsapp"); setCampanha("");
      setCorretorResponsavel(""); setTemperatura("morno"); setNovaNota("");
      setHistoricoNotas([]);
    }
  }, [lead, open]);

  // ── Validation ────────────────────────────────────────────────────────
  const isValid = nome.trim().length > 0 && (telefone.replace(/\D/g, "").length >= 10 || email.trim().length > 0);

  // ── Build payload ─────────────────────────────────────────────────────
  const buildPayload = (): CreateLeadInput => {
    // Append new note with timestamp
    let finalNotas = historicoNotas.join("\n---\n");
    if (novaNota.trim()) {
      const timestamp = new Date().toLocaleString("pt-BR");
      const entry = `[${timestamp}] ${novaNota.trim()}`;
      finalNotas = finalNotas ? `${entry}\n---\n${finalNotas}` : entry;
    }

    return {
      nome: nome.trim(),
      telefone: telefone || undefined,
      email: email || undefined,
      interesse_tipo: interesseTipo,
      imovel_interesse_nome: imovelNome || null,
      valor_estimado: valorDe ? Number(valorDe) : null,
      fonte,
      temperatura,
      notas: finalNotas || undefined,
      corretor_responsavel: corretorResponsavel || null,
    };
  };

  const handleSave = () => {
    if (!isValid) return;
    onSubmit(buildPayload());
  };

  const handleSaveAndSchedule = () => {
    if (!isValid) return;
    if (onSubmitAndSchedule) {
      onSubmitAndSchedule(buildPayload());
    } else {
      onSubmit(buildPayload());
    }
  };

  // ── Bairros chips ─────────────────────────────────────────────────────
  const addBairro = () => {
    const b = bairroInput.trim();
    if (b && !bairros.includes(b)) {
      setBairros([...bairros, b]);
      setBairroInput("");
    }
  };

  const removeBairro = (b: string) => {
    setBairros(bairros.filter((x) => x !== b));
  };

  // ── WhatsApp ──────────────────────────────────────────────────────────
  const whatsappUrl = telefone.replace(/\D/g, "").length >= 10
    ? `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${nome}, tudo bem? Sou corretor(a) e gostaria de conversar sobre seu interesse em imóveis.`)}`
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-card z-10">
          <SheetTitle className="text-lg">{lead ? "Editar Lead" : "Novo Lead"}</SheetTitle>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">

          {/* ── Seção 1: Dados Pessoais ─────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Dados Pessoais</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do lead" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
              </div>
              {!isValid && nome.trim() && (
                <p className="text-xs text-amber-500">Informe ao menos telefone ou e-mail.</p>
              )}
            </div>
          </section>

          <Separator />

          {/* ── Seção 2: Interesse ──────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Interesse</h3>
            <div className="space-y-3">
              {/* Tipo de interesse — radio visual */}
              <div>
                <Label>Tipo</Label>
                <div className="flex gap-2 mt-1">
                  {(["compra", "aluguel", "lancamento"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setInteresseTipo(tipo)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                        interesseTipo === tipo
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                      )}
                    >
                      {tipo === "compra" ? "Compra" : tipo === "aluguel" ? "Aluguel" : "Lançamento"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="imovel">Imóvel de interesse</Label>
                <Input id="imovel" value={imovelNome} onChange={(e) => setImovelNome(e.target.value)} placeholder="Buscar imóvel..." />
                <p className="text-[10px] text-muted-foreground mt-1">Busca em tempo real será conectada à tabela properties.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor de (R$)</Label>
                  <Input type="number" value={valorDe} onChange={(e) => setValorDe(e.target.value)} placeholder="300000" />
                </div>
                <div>
                  <Label>Valor até (R$)</Label>
                  <Input type="number" value={valorAte} onChange={(e) => setValorAte(e.target.value)} placeholder="900000" />
                </div>
              </div>

              {/* Bairros multi-select with chips */}
              <div>
                <Label>Bairros de interesse</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={bairroInput}
                    onChange={(e) => setBairroInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBairro(); } }}
                    placeholder="Digite e pressione Enter"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addBairro}>+</Button>
                </div>
                {bairros.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {bairros.map((b) => (
                      <Badge key={b} variant="secondary" className="gap-1 pr-1">
                        {b}
                        <button type="button" title={`Remover ${b}`} onClick={() => removeBairro(b)} className="ml-0.5 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes sobre o interesse..." rows={2} />
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Seção 3: Origem ─────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Origem</h3>
            <div className="space-y-3">
              <div>
                <Label>Fonte</Label>
                <Select value={fonte} onValueChange={(v) => setFonte(v as LeadFonte)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="outro">Portais / Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Campanha</Label>
                  <Input value={campanha} onChange={(e) => setCampanha(e.target.value)} placeholder="Nome da campanha" />
                </div>
                <div>
                  <Label>Corretor responsável</Label>
                  <Input value={corretorResponsavel} onChange={(e) => setCorretorResponsavel(e.target.value)} placeholder="Nome do corretor" />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Seção 4: Temperatura ────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Temperatura</h3>
            <div className="flex gap-2">
              {TEMP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTemperatura(opt.id)}
                  className={cn(
                    "flex-1 rounded-xl border-2 p-3 text-center transition-all",
                    temperatura === opt.id ? opt.activeColor : opt.color
                  )}
                >
                  <span className="text-2xl block mb-1">{opt.emoji}</span>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* ── Seção 5: Notas ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Notas</h3>
            <Textarea
              value={novaNota}
              onChange={(e) => setNovaNota(e.target.value)}
              placeholder="Adicionar nota..."
              rows={2}
            />
            {historicoNotas.length > 0 && (
              <div className="mt-3 space-y-2 max-h-[150px] overflow-y-auto">
                {historicoNotas.map((nota, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                    {nota}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Actions (sticky bottom) ──────────────────────────────────── */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex flex-wrap gap-2">
          {whatsappUrl && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-500/30 hover:bg-green-500/10"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              WhatsApp
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleSaveAndSchedule} disabled={!isValid || isSubmitting}>
            <CalendarPlus className="w-4 h-4 mr-1.5" />
            Salvar e Agendar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {lead ? "Salvar" : "Criar Lead"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
