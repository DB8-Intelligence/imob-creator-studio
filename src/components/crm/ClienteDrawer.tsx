/**
 * ClienteDrawer.tsx — Sheet drawer for client details with 3 tabs: Perfil, Negocios, Historico
 */
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Plus, X, Camera } from "lucide-react";
import { useUpdateCliente } from "@/hooks/useCrmClientes";
import { useNegocios } from "@/hooks/useCrmNegocios";
import { useLeadActivities } from "@/hooks/useLeadActivities";
import { useToast } from "@/hooks/use-toast";
import NegocioModal from "./NegocioModal";
import type { CrmCliente, ClienteTipo, UpdateClienteInput } from "@/types/crm";
import { CLIENTE_TIPO_CONFIG, NEGOCIO_TIPO_CONFIG, NEGOCIO_STATUS_CONFIG } from "@/types/crm";

interface ClienteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: CrmCliente | null;
  isNew?: boolean;
  onSaveNew?: (data: UpdateClienteInput & { nome: string; tipo: ClienteTipo }) => void;
}

function cpfMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

const ClienteDrawer: React.FC<ClienteDrawerProps> = ({ open, onOpenChange, cliente, isNew, onSaveNew }) => {
  const [tab, setTab] = useState("perfil");
  const [negocioModalOpen, setNegocioModalOpen] = useState(false);
  const updateCliente = useUpdateCliente();
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    nome: "", cpf: "", rg: "", data_nascimento: "", email: "", telefone: "",
    whatsapp: "", profissao: "", estado_civil: "", endereco_completo: "",
    tipo: "comprador" as ClienteTipo, observacoes: "", tags: [] as string[],
    foto_url: "",
  });
  const [newTag, setNewTag] = useState("");

  // Negocios for this cliente
  const { data: negocios = [] } = useNegocios(cliente ? { clienteId: cliente.id } : undefined);

  // Activities (if linked to a lead)
  const { data: activities = [] } = useLeadActivities(cliente?.lead_id ?? null);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome,
        cpf: cliente.cpf,
        rg: cliente.rg,
        data_nascimento: cliente.data_nascimento ?? "",
        email: cliente.email,
        telefone: cliente.telefone,
        whatsapp: cliente.whatsapp,
        profissao: cliente.profissao,
        estado_civil: cliente.estado_civil,
        endereco_completo: cliente.endereco_completo,
        tipo: cliente.tipo,
        observacoes: cliente.observacoes,
        tags: cliente.tags ?? [],
        foto_url: cliente.foto_url,
      });
    } else {
      setForm({
        nome: "", cpf: "", rg: "", data_nascimento: "", email: "", telefone: "",
        whatsapp: "", profissao: "", estado_civil: "", endereco_completo: "",
        tipo: "comprador", observacoes: "", tags: [], foto_url: "",
      });
    }
    setTab("perfil");
  }, [cliente, open]);

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatorio", variant: "destructive" });
      return;
    }
    if (isNew && onSaveNew) {
      onSaveNew({ ...form });
      onOpenChange(false);
      return;
    }
    if (!cliente) return;
    updateCliente.mutate({
      id: cliente.id,
      ...form,
    });
    toast({ title: "Cliente atualizado" });
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const negocioTotal = negocios.reduce((s, n) => s + n.valor_comissao_liquida, 0);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[560px] sm:max-w-[560px] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>{isNew ? "Novo Cliente" : cliente?.nome ?? "Cliente"}</SheetTitle>
          </SheetHeader>

          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mb-2">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              {!isNew && <TabsTrigger value="negocios">Negocios ({negocios.length})</TabsTrigger>}
              {!isNew && <TabsTrigger value="historico">Historico</TabsTrigger>}
            </TabsList>

            <ScrollArea className="flex-1 px-6">
              {/* ─── Perfil ─── */}
              <TabsContent value="perfil" className="mt-0 space-y-4 pb-4">
                {/* Photo area */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                    {form.foto_url ? (
                      <img src={form.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={form.foto_url}
                      onChange={(e) => setForm((p) => ({ ...p, foto_url: e.target.value }))}
                      placeholder="URL da foto"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Personal data */}
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={form.cpf}
                      onChange={(e) => setForm((p) => ({ ...p, cpf: cpfMask(e.target.value) }))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input value={form.rg} onChange={(e) => setForm((p) => ({ ...p, rg: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data de nascimento</Label>
                    <Input type="date" value={form.data_nascimento} onChange={(e) => setForm((p) => ({ ...p, data_nascimento: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado civil</Label>
                    <Select value={form.estado_civil} onValueChange={(v) => setForm((p) => ({ ...p, estado_civil: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viuvo(a)</SelectItem>
                        <SelectItem value="uniao_estavel">Uniao estavel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Profissao</Label>
                  <Input value={form.profissao} onChange={(e) => setForm((p) => ({ ...p, profissao: e.target.value }))} />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Endereco completo</Label>
                  <Input value={form.endereco_completo} onChange={(e) => setForm((p) => ({ ...p, endereco_completo: e.target.value }))} />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as ClienteTipo }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLIENTE_TIPO_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nova tag"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addTag}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* ─── Negocios ─── */}
              <TabsContent value="negocios" className="mt-0 space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Negocios</h4>
                  <Button size="sm" onClick={() => setNegocioModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Novo negocio
                  </Button>
                </div>
                {negocios.map((neg) => {
                  const tipoCfg = NEGOCIO_TIPO_CONFIG[neg.tipo];
                  const statusCfg = NEGOCIO_STATUS_CONFIG[neg.status];
                  return (
                    <div key={neg.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={tipoCfg.color}>{tipoCfg.label}</Badge>
                        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Valor: </span>
                          <span className="font-medium">{formatCurrency(neg.valor_negociado)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Comissao: </span>
                          <span className="font-medium text-emerald-600">{formatCurrency(neg.valor_comissao_liquida)}</span>
                        </div>
                      </div>
                      {neg.data_fechamento && (
                        <p className="text-[10px] text-muted-foreground">
                          Fechamento: {new Date(neg.data_fechamento).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  );
                })}
                {negocios.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum negocio registrado</p>
                )}
                {negocios.length > 0 && (
                  <div className="border-t pt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total comissoes:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(negocioTotal)}</span>
                  </div>
                )}
              </TabsContent>

              {/* ─── Historico ─── */}
              <TabsContent value="historico" className="mt-0 space-y-3 pb-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{act.tipo.replace(/_/g, " ")}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      {act.descricao && <p className="text-sm text-gray-700 mt-0.5">{act.descricao}</p>}
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum historico disponivel</p>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <SheetFooter className="px-6 py-4 border-t">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Negocio modal */}
      {cliente && (
        <NegocioModal
          open={negocioModalOpen}
          onOpenChange={setNegocioModalOpen}
          clienteId={cliente.id}
        />
      )}
    </>
  );
};

export default ClienteDrawer;
