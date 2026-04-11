/**
 * NegocioModal.tsx — Dialog for creating/editing a deal (negocio)
 */
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useCreateNegocio } from "@/hooks/useCrmNegocios";
import type { NegocioTipo } from "@/types/crm";
import { NEGOCIO_TIPO_CONFIG, calcularValores } from "@/types/crm";

interface NegocioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  leadId?: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

const NegocioModal: React.FC<NegocioModalProps> = ({ open, onOpenChange, clienteId, leadId }) => {
  const createNegocio = useCreateNegocio();

  const [tipo, setTipo] = useState<NegocioTipo>("venda");
  const [valorImovel, setValorImovel] = useState("");
  const [valorNegociado, setValorNegociado] = useState("");
  const [percentualComissao, setPercentualComissao] = useState(6);
  const [percentualRepasse, setPercentualRepasse] = useState(0);
  const [dataFechamento, setDataFechamento] = useState("");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const preview = useMemo(() => {
    const neg = Number(valorNegociado) || 0;
    return calcularValores(neg, percentualComissao, percentualRepasse);
  }, [valorNegociado, percentualComissao, percentualRepasse]);

  const handleSave = () => {
    const vImovel = Number(valorImovel) || 0;
    const vNeg = Number(valorNegociado) || 0;
    if (vNeg <= 0) return;

    createNegocio.mutate({
      cliente_id: clienteId,
      lead_id: leadId ?? null,
      tipo,
      valor_imovel: vImovel,
      valor_negociado: vNeg,
      percentual_comissao: percentualComissao,
      percentual_repasse: percentualRepasse,
      data_fechamento: dataFechamento || null,
      numero_contrato: numeroContrato,
      observacoes,
    });

    // Reset
    setTipo("venda");
    setValorImovel("");
    setValorNegociado("");
    setPercentualComissao(6);
    setPercentualRepasse(0);
    setDataFechamento("");
    setNumeroContrato("");
    setObservacoes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Negocio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de negocio</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as NegocioTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(NEGOCIO_TIPO_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor do imovel (R$)</Label>
              <Input
                type="number"
                value={valorImovel}
                onChange={(e) => setValorImovel(e.target.value)}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor negociado (R$)</Label>
              <Input
                type="number"
                value={valorNegociado}
                onChange={(e) => setValorNegociado(e.target.value)}
                placeholder="480000"
              />
            </div>
          </div>

          {/* Commission slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>% Comissao</Label>
              <span className="text-sm font-medium">{percentualComissao}%</span>
            </div>
            <Slider
              value={[percentualComissao]}
              onValueChange={([v]) => setPercentualComissao(v)}
              min={0}
              max={10}
              step={0.5}
            />
            <div className="text-sm text-muted-foreground">
              Comissao bruta: <span className="font-medium text-foreground">{formatCurrency(preview.bruta)}</span>
            </div>
          </div>

          {/* Repasse slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>% Repasse</Label>
              <span className="text-sm font-medium">{percentualRepasse}%</span>
            </div>
            <Slider
              value={[percentualRepasse]}
              onValueChange={([v]) => setPercentualRepasse(v)}
              min={0}
              max={100}
              step={5}
            />
            <div className="text-sm">
              Comissao liquida: <span className="font-bold text-emerald-600">{formatCurrency(preview.liquida)}</span>
            </div>
          </div>

          {/* Date + contract */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data de fechamento</Label>
              <Input
                type="date"
                value={dataFechamento}
                onChange={(e) => setDataFechamento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>N. do contrato</Label>
              <Input
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
                placeholder="CTR-001"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observacoes</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Detalhes do negocio..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!Number(valorNegociado)}>
            <Save className="h-4 w-4 mr-1" /> Salvar negocio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NegocioModal;
