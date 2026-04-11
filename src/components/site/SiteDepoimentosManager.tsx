import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { SiteDepoimento } from "@/types/site";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Star,
  Loader2,
  MessageSquareQuote,
  Pencil,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIPO_NEGOCIO_OPTIONS = [
  { value: "Compra", label: "Compra" },
  { value: "Venda", label: "Venda" },
  { value: "Aluguel", label: "Aluguel" },
  { value: "Avaliação", label: "Avaliação" },
];

const EMPTY_DEPOIMENTO: Partial<SiteDepoimento> = {
  nome_cliente: "",
  texto: "",
  avaliacao: 5,
  tipo_negocio: "Compra",
  ativo: true,
  ordem: 0,
  foto_url: "",
};

const TEXTO_MAX = 300;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          onClick={() => onChange?.(i)}
        >
          <Star
            className={`h-5 w-5 ${
              i <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SiteDepoimentosManagerProps {
  siteId: string;
}

export function SiteDepoimentosManager({ siteId }: SiteDepoimentosManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [depoimentos, setDepoimentos] = useState<SiteDepoimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SiteDepoimento>>({ ...EMPTY_DEPOIMENTO });

  /* ---------- Fetch ---------- */

  const fetchDepoimentos = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("site_depoimentos")
      .select("*")
      .eq("site_id", siteId)
      .order("ordem", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar depoimentos", description: error.message, variant: "destructive" });
    }
    setDepoimentos((data as unknown as SiteDepoimento[]) ?? []);
    setLoading(false);
  }, [siteId, toast]);

  useEffect(() => {
    fetchDepoimentos();
  }, [fetchDepoimentos]);

  /* ---------- Form helpers ---------- */

  const updateForm = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_DEPOIMENTO });
    setDialogOpen(true);
  };

  const openEdit = (dep: SiteDepoimento) => {
    setEditingId(dep.id);
    setForm({ ...dep });
    setDialogOpen(true);
  };

  /* ---------- Save ---------- */

  const handleSave = async () => {
    if (!user || !siteId) return;
    if (!form.nome_cliente?.trim()) {
      toast({ title: "Nome do cliente é obrigatório", variant: "destructive" });
      return;
    }
    if (!form.texto?.trim()) {
      toast({ title: "Texto do depoimento é obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      user_id: user.id,
      site_id: siteId,
    };

    let error;
    if (editingId) {
      const { error: e } = await supabase
        .from("site_depoimentos")
        .update(payload as never)
        .eq("id", editingId);
      error = e;
    } else {
      const { error: e } = await supabase
        .from("site_depoimentos")
        .insert(payload as never);
      error = e;
    }

    if (error) {
      toast({ title: "Erro ao salvar depoimento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Depoimento atualizado!" : "Depoimento adicionado!" });
      setDialogOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_DEPOIMENTO });
      fetchDepoimentos();
    }
    setSaving(false);
  };

  /* ---------- Toggle ativo ---------- */

  const toggleAtivo = async (dep: SiteDepoimento) => {
    const { error } = await supabase
      .from("site_depoimentos")
      .update({ ativo: !dep.ativo } as never)
      .eq("id", dep.id);

    if (error) {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    } else {
      fetchDepoimentos();
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-bold">Depoimentos</h2>
          <Badge variant="secondary" className="text-xs">
            {depoimentos.length}
          </Badge>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : depoimentos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquareQuote className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Nenhum depoimento cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">
              Adicione depoimentos de clientes para exibir no site
            </p>
            <Button onClick={openAdd} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" />
              Adicionar Depoimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {depoimentos.map((dep) => (
            <Card
              key={dep.id}
              className={`transition-all hover:shadow-md ${
                !dep.ativo ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-5 space-y-3">
                {/* Client info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {dep.foto_url ? (
                      <img
                        src={dep.foto_url}
                        alt={dep.nome_cliente}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {getInitials(dep.nome_cliente)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{dep.nome_cliente}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {dep.tipo_negocio}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => openEdit(dep)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Stars */}
                <StarRating value={dep.avaliacao} readonly />

                {/* Text */}
                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                  "{dep.texto}"
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {dep.ativo ? "Visível no site" : "Oculto"}
                  </span>
                  <Switch
                    checked={dep.ativo}
                    onCheckedChange={() => toggleAtivo(dep)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ===================== DIALOG — Add/Edit ===================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Depoimento" : "Novo Depoimento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Nome do Cliente *</Label>
              <Input
                className="mt-1"
                placeholder="Ex: Maria Silva"
                value={form.nome_cliente ?? ""}
                onChange={(e) => updateForm("nome_cliente", e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Depoimento *</Label>
                <span
                  className={`text-xs ${
                    (form.texto?.length ?? 0) > TEXTO_MAX
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {form.texto?.length ?? 0}/{TEXTO_MAX}
                </span>
              </div>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="O que o cliente disse sobre o serviço..."
                value={form.texto ?? ""}
                onChange={(e) => updateForm("texto", e.target.value.slice(0, TEXTO_MAX))}
              />
            </div>

            <div>
              <Label className="mb-2 block">Avaliação</Label>
              <StarRating
                value={form.avaliacao ?? 5}
                onChange={(v) => updateForm("avaliacao", v)}
              />
            </div>

            <div>
              <Label>Tipo de Negócio</Label>
              <Select
                value={form.tipo_negocio ?? "Compra"}
                onValueChange={(v) => updateForm("tipo_negocio", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_NEGOCIO_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
