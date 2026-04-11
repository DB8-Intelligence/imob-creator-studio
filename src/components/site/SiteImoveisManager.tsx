import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { SiteImovel, TipoImovel, FinalidadeImovel, StatusImovel } from "@/types/site";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Home,
  BedDouble,
  Bath,
  Maximize2,
  Image as ImageIcon,
  Upload,
  X,
  MapPin,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIPO_OPTIONS: { value: TipoImovel; label: string }[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "rural", label: "Rural" },
  { value: "cobertura", label: "Cobertura" },
  { value: "studio", label: "Studio" },
];

const FINALIDADE_OPTIONS: { value: FinalidadeImovel; label: string }[] = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "temporada", label: "Temporada" },
];

const STATUS_OPTIONS: { value: StatusImovel; label: string; color: string }[] = [
  { value: "disponivel", label: "Disponível", color: "bg-green-500" },
  { value: "reservado", label: "Reservado", color: "bg-yellow-500" },
  { value: "vendido", label: "Vendido", color: "bg-red-500" },
  { value: "alugado", label: "Alugado", color: "bg-blue-500" },
];

const FEATURES_LIST = [
  "Piscina",
  "Academia",
  "Churrasqueira",
  "Playground",
  "Portaria 24h",
  "Elevador",
  "Varanda",
  "Vista mar",
  "Condomínio fechado",
  "Mobiliado",
  "Pet friendly",
];

const EMPTY_IMOVEL: Partial<SiteImovel> = {
  titulo: "",
  descricao: "",
  tipo: "apartamento",
  finalidade: "venda",
  status: "disponivel",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  preco: undefined,
  preco_condominio: undefined,
  quartos: 0,
  suites: 0,
  banheiros: 0,
  vagas: 0,
  area_total: undefined,
  area_construida: undefined,
  fotos: [],
  foto_capa: "",
  features: [],
  destaque: false,
  ordem_exibicao: 0,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(status: StatusImovel) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  const colors: Record<string, string> = {
    disponivel: "bg-green-100 text-green-700 border-green-300",
    reservado: "bg-yellow-100 text-yellow-700 border-yellow-300",
    vendido: "bg-red-100 text-red-700 border-red-300",
    alugado: "bg-blue-100 text-blue-700 border-blue-300",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[status] ?? ""}`}>
      {opt?.label ?? status}
    </Badge>
  );
}

function formatBRL(value?: number) {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SiteImoveisManagerProps {
  siteId: string;
}

export function SiteImoveisManager({ siteId }: SiteImoveisManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [imoveis, setImoveis] = useState<SiteImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [finalidadeFilter, setFinalidadeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sheet / form
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SiteImovel>>({ ...EMPTY_IMOVEL });

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /* ---------- Fetch ---------- */

  const fetchImoveis = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("site_imoveis")
      .select("*")
      .eq("site_id", siteId)
      .order("ordem_exibicao", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar imóveis", description: error.message, variant: "destructive" });
    }
    setImoveis((data as unknown as SiteImovel[]) ?? []);
    setLoading(false);
  }, [siteId, toast]);

  useEffect(() => {
    fetchImoveis();
  }, [fetchImoveis]);

  /* ---------- ViaCEP ---------- */

  const lookupCEP = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          endereco: data.logradouro || prev?.endereco,
          bairro: data.bairro || prev?.bairro,
          cidade: data.localidade || prev?.cidade,
          estado: data.uf || prev?.estado,
        }));
      }
    } catch {
      /* silent */
    }
  };

  /* ---------- Photo upload ---------- */

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const newPhotos = [...(form.fotos ?? [])];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-fotos").upload(path, file);
      if (error) {
        toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("site-fotos").getPublicUrl(path);
      newPhotos.push(urlData.publicUrl);
    }

    setForm((prev) => ({
      ...prev,
      fotos: newPhotos,
      foto_capa: prev?.foto_capa || newPhotos[0] || "",
    }));
    setUploading(false);
  };

  const removePhoto = (url: string) => {
    setForm((prev) => {
      const updated = (prev?.fotos ?? []).filter((f) => f !== url);
      return {
        ...prev,
        fotos: updated,
        foto_capa: prev?.foto_capa === url ? (updated[0] || "") : prev?.foto_capa,
      };
    });
  };

  const setCover = (url: string) => {
    setForm((prev) => ({ ...prev, foto_capa: url }));
  };

  /* ---------- Save ---------- */

  const handleSave = async () => {
    if (!user || !siteId) return;
    if (!form.titulo?.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
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
        .from("site_imoveis")
        .update(payload as never)
        .eq("id", editingId);
      error = e;
    } else {
      const { error: e } = await supabase
        .from("site_imoveis")
        .insert(payload as never);
      error = e;
    }

    if (error) {
      toast({ title: "Erro ao salvar imóvel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Imóvel atualizado!" : "Imóvel adicionado!" });
      setSheetOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_IMOVEL });
      fetchImoveis();
    }
    setSaving(false);
  };

  /* ---------- Actions ---------- */

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_IMOVEL });
    setSheetOpen(true);
  };

  const openEdit = (imovel: SiteImovel) => {
    setEditingId(imovel.id);
    setForm({ ...imovel });
    setSheetOpen(true);
  };

  const toggleDestaque = async (imovel: SiteImovel) => {
    const { error } = await supabase
      .from("site_imoveis")
      .update({ destaque: !imovel.destaque } as never)
      .eq("id", imovel.id);
    if (error) {
      toast({ title: "Erro ao alterar destaque", variant: "destructive" });
    } else {
      fetchImoveis();
    }
  };

  const deleteImovel = async (id: string) => {
    const { error } = await supabase.from("site_imoveis").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Imóvel excluído" });
      fetchImoveis();
    }
  };

  /* ---------- Filtering ---------- */

  const filtered = imoveis.filter((im) => {
    if (searchQuery && !im.titulo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tipoFilter !== "all" && im.tipo !== tipoFilter) return false;
    if (finalidadeFilter !== "all" && im.finalidade !== finalidadeFilter) return false;
    return true;
  });

  /* ---------- Stats ---------- */

  const stats = {
    total: imoveis.length,
    disponivel: imoveis.filter((i) => i.status === "disponivel").length,
    reservado: imoveis.filter((i) => i.status === "reservado").length,
    vendido: imoveis.filter((i) => i.status === "vendido" || i.status === "alugado").length,
  };

  /* ---------- Form helpers ---------- */

  const updateForm = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleFeature = (feat: string) => {
    setForm((prev) => {
      const current = prev?.features ?? [];
      return {
        ...prev,
        features: current.includes(feat) ? current.filter((f) => f !== feat) : [...current, feat],
      };
    });
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-gray-700" },
          { label: "Disponíveis", value: stats.disponivel, color: "text-green-600" },
          { label: "Reservados", value: stats.reservado, color: "text-yellow-600" },
          { label: "Vendidos", value: stats.vendido, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Imóveis do Site</h2>
          <Badge variant="secondary" className="text-xs">
            {imoveis.length}
          </Badge>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Adicionar Imóvel
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar imóvel..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIPO_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={finalidadeFilter} onValueChange={setFinalidadeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Finalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {FINALIDADE_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-md">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            className="h-9 px-3"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className="h-9 px-3"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Nenhum imóvel cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">
              Adicione seu primeiro imóvel para exibir no site
            </p>
            <Button onClick={openAdd} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" />
              Adicionar Imóvel
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((im) => (
            <Card key={im.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Photo */}
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                {im.foto_capa || (im.fotos && im.fotos.length > 0) ? (
                  <img
                    src={im.foto_capa || im.fotos[0]}
                    alt={im.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                )}
                <div className="absolute top-2 left-2">{statusBadge(im.status)}</div>
                {im.destaque && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm line-clamp-1">{im.titulo}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(im)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleDestaque(im)}>
                        <Star className="h-3.5 w-3.5 mr-2" />
                        {im.destaque ? "Remover destaque" : "Destacar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteImovel(im.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Badge variant="outline" className="text-[10px]">
                    {TIPO_OPTIONS.find((t) => t.value === im.tipo)?.label ?? im.tipo}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {FINALIDADE_OPTIONS.find((f) => f.value === im.finalidade)?.label ?? im.finalidade}
                  </Badge>
                </div>

                <p className="text-base font-bold text-green-700">{formatBRL(im.preco)}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t">
                  {im.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {im.quartos}
                    </span>
                  )}
                  {im.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" />
                      {im.banheiros}
                    </span>
                  )}
                  {im.area_total && (
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {im.area_total}m²
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {filtered.map((im) => (
            <Card key={im.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {im.foto_capa || (im.fotos && im.fotos.length > 0) ? (
                    <img
                      src={im.foto_capa || im.fotos[0]}
                      alt={im.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{im.titulo}</p>
                    {im.destaque && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    {statusBadge(im.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{TIPO_OPTIONS.find((t) => t.value === im.tipo)?.label}</span>
                    <span>{FINALIDADE_OPTIONS.find((f) => f.value === im.finalidade)?.label}</span>
                    {im.quartos > 0 && <span>{im.quartos} qts</span>}
                    {im.area_total && <span>{im.area_total}m²</span>}
                  </div>
                </div>
                <p className="font-bold text-green-700 flex-shrink-0">{formatBRL(im.preco)}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(im)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleDestaque(im)}>
                      <Star className="h-3.5 w-3.5 mr-2" />
                      {im.destaque ? "Remover destaque" : "Destacar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => deleteImovel(im.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ===================== SHEET — Add/Edit Form ===================== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Imóvel" : "Novo Imóvel"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Atualize as informações do imóvel"
                : "Preencha os dados para adicionar um imóvel ao site"}
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="dados" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados" className="text-xs">Dados</TabsTrigger>
              <TabsTrigger value="localizacao" className="text-xs">Localização</TabsTrigger>
              <TabsTrigger value="caracteristicas" className="text-xs">Características</TabsTrigger>
              <TabsTrigger value="fotos" className="text-xs">Fotos</TabsTrigger>
            </TabsList>

            {/* TAB: Dados */}
            <TabsContent value="dados" className="space-y-4 mt-4">
              <div>
                <Label>Título *</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Apartamento 3 quartos na Barra"
                  value={form.titulo ?? ""}
                  onChange={(e) => updateForm("titulo", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={form.tipo ?? "apartamento"}
                    onValueChange={(v) => updateForm("tipo", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Finalidade</Label>
                  <Select
                    value={form.finalidade ?? "venda"}
                    onValueChange={(v) => updateForm("finalidade", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FINALIDADE_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={form.status ?? "disponivel"}
                  onValueChange={(v) => updateForm("status", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    placeholder="0,00"
                    value={form.preco ?? ""}
                    onChange={(e) =>
                      updateForm("preco", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div>
                  <Label>Condomínio (R$)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    placeholder="0,00"
                    value={form.preco_condominio ?? ""}
                    onChange={(e) =>
                      updateForm(
                        "preco_condominio",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  placeholder="Descreva o imóvel..."
                  value={form.descricao ?? ""}
                  onChange={(e) => updateForm("descricao", e.target.value)}
                />
              </div>
            </TabsContent>

            {/* TAB: Localização */}
            <TabsContent value="localizacao" className="space-y-4 mt-4">
              <div>
                <Label>CEP</Label>
                <Input
                  className="mt-1"
                  placeholder="00000-000"
                  value={form.cep ?? ""}
                  onChange={(e) => updateForm("cep", e.target.value)}
                  onBlur={(e) => lookupCEP(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Preencha o CEP para autocompletar o endereço
                </p>
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  className="mt-1"
                  value={form.endereco ?? ""}
                  onChange={(e) => updateForm("endereco", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bairro</Label>
                  <Input
                    className="mt-1"
                    value={form.bairro ?? ""}
                    onChange={(e) => updateForm("bairro", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    className="mt-1"
                    value={form.cidade ?? ""}
                    onChange={(e) => updateForm("cidade", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  className="mt-1"
                  placeholder="UF"
                  maxLength={2}
                  value={form.estado ?? ""}
                  onChange={(e) => updateForm("estado", e.target.value.toUpperCase())}
                />
              </div>
            </TabsContent>

            {/* TAB: Características */}
            <TabsContent value="caracteristicas" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "quartos", label: "Quartos" },
                  { field: "suites", label: "Suítes" },
                  { field: "banheiros", label: "Banheiros" },
                  { field: "vagas", label: "Vagas" },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      min={0}
                      className="mt-1"
                      value={(form as Record<string, unknown>)[field] ?? 0}
                      onChange={(e) => updateForm(field, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Área Total (m²)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={form.area_total ?? ""}
                    onChange={(e) =>
                      updateForm("area_total", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div>
                  <Label>Área Construída (m²)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={form.area_construida ?? ""}
                    onChange={(e) =>
                      updateForm(
                        "area_construida",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Características</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES_LIST.map((feat) => (
                    <label
                      key={feat}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={(form.features ?? []).includes(feat)}
                        onCheckedChange={() => toggleFeature(feat)}
                      />
                      {feat}
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB: Fotos */}
            <TabsContent value="fotos" className="space-y-4 mt-4">
              {/* Drag / Upload area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePhotoUpload(e.dataTransfer.files);
                }}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Arraste fotos aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />

              {/* Photo grid */}
              {(form.fotos ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {(form.fotos ?? []).map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {form.foto_capa === url && (
                        <div className="absolute top-1 left-1">
                          <Badge className="bg-yellow-500 text-white text-[10px] gap-1">
                            <Star className="h-3 w-3" />
                            Capa
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {form.foto_capa !== url && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                            onClick={() => setCover(url)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Capa
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => removePhoto(url)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Save button */}
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Salvar Alterações" : "Adicionar Imóvel"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
