/**
 * ImoveisListagemPage.tsx — Listagem de imóveis (MAX)
 *
 * Cards com: foto, título, status, leads interessados, visitas, ações rápidas.
 * Integra com o inbox existente + dados extras do MAX.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  List, Plus, Search, ImageIcon, Users, CalendarDays,
  MessageCircle, FileDown, Edit3, Loader2, Building2,
} from "lucide-react";
import { useInboxProperties, useUpdatePropertyStatus } from "@/hooks/useInboxProperties";
import { usePropertyListingStats } from "@/hooks/usePropertyMAX";
import type { InboxProperty } from "@/components/inbox/PropertyCard";

type StatusFilter = "all" | "new" | "processing" | "ready" | "approved" | "published";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  new:        { label: "Novo",       color: "bg-blue-500/10 text-blue-500" },
  processing: { label: "Processando", color: "bg-amber-500/10 text-amber-500" },
  ready:      { label: "Pronto",     color: "bg-emerald-500/10 text-emerald-500" },
  approved:   { label: "Aprovado",   color: "bg-violet-500/10 text-violet-500" },
  published:  { label: "Publicado",  color: "bg-slate-500/10 text-slate-500" },
};

function formatCurrency(v: number | null | undefined): string {
  if (!v) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function ImoveisListagemPage() {
  const navigate = useNavigate();
  const { data: properties, isLoading } = useInboxProperties();
  const { data: stats } = usePropertyListingStats();
  const updateStatus = useUpdatePropertyStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    if (!properties) return [];
    let result = [...properties];
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.neighborhood?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [properties, statusFilter, search]);

  const getStats = (propertyId: string) => stats?.find((s) => s.propertyId === propertyId);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Imóveis</h1>
              <p className="text-sm text-muted-foreground">{properties?.length ?? 0} imóveis cadastrados</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 h-9 w-[200px] text-sm" placeholder="Buscar imóvel..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => navigate("/imoveis/upload")} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-medium text-foreground">Nenhum imóvel encontrado</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Cadastre seu primeiro imóvel para começar.</p>
            <Button onClick={() => navigate("/imoveis/upload")} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar imóvel
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((property) => {
              const pStats = getStats(property.id);
              const stLabel = STATUS_LABEL[property.status];
              const firstImage = property.images?.[0];

              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Image */}
                  <div className="relative aspect-video bg-muted">
                    {firstImage ? (
                      <img src={firstImage} alt={property.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    {/* MAX badges overlay */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {pStats && pStats.leadsCount > 0 && (
                        <Badge className="bg-accent/90 text-accent-foreground border-none text-[10px] gap-1">
                          <Users className="w-3 h-3" />
                          {pStats.leadsCount}
                        </Badge>
                      )}
                      {pStats && pStats.visitsCount > 0 && (
                        <Badge className="bg-purple-500/90 text-white border-none text-[10px] gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {pStats.visitsCount}
                        </Badge>
                      )}
                    </div>
                    {stLabel && (
                      <Badge className={`absolute top-2 right-2 text-[10px] border-none ${stLabel.color}`}>
                        {stLabel.label}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{property.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {property.city && <span>{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ""}</span>}
                      {property.investment_value && <span className="font-semibold text-foreground">{formatCurrency(property.investment_value)}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-1">
                      <Button size="sm" className="flex-1 text-xs h-8" onClick={() => navigate(`/imoveis/editor/${property.id}`)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-500" title="WhatsApp"
                        onClick={() => alert("Compartilhar book do imóvel via WhatsApp")}>
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Gerar Book PDF"
                        onClick={() => alert("Gerar Book PDF do imóvel")}>
                        <FileDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
