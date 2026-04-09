import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Home,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingProperty {
  id: string;
  reference: string;
  type: string | null;
  bedrooms: number | null;
  suites: number | null;
  parking: number | null;
  area_built: number | null;
  price: number | null;
  address: Record<string, string>;
  photos: string[];
  description: string | null;
  source_contact: string | null;
  source_phone: string | null;
  ai_extracted: Record<string, unknown> | null;
  created_at: string;
}

export function PropertyInbox() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingProperty | null>(null);
  const [editing, setEditing] = useState<Partial<PendingProperty>>({});
  const [approving, setApproving] = useState(false);

  const fetchPending = useCallback(async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });
    setProperties((data as PendingProperty[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async () => {
    if (!selected) return;
    setApproving(true);
    const { error } = await supabase
      .from("properties")
      .update({
        ...editing,
        status: "active",
      })
      .eq("id", selected.id);

    if (error) {
      toast({ title: "Erro ao aprovar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Imóvel aprovado!", description: `${selected.reference} publicado com sucesso.` });
      setSelected(null);
      fetchPending();
    }
    setApproving(false);
  };

  if (loading) return null;
  if (properties.length === 0) return null;

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            {properties.length} {properties.length === 1 ? "imóvel aguardando" : "imóveis aguardando"} aprovação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {properties.slice(0, 5).map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelected(p);
                setEditing({
                  type: p.type,
                  bedrooms: p.bedrooms,
                  suites: p.suites,
                  parking: p.parking,
                  area_built: p.area_built,
                  price: p.price,
                  description: p.description,
                });
              }}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-amber-300 transition-colors"
            >
              {p.photos[0] ? (
                <img src={p.photos[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Home className="h-6 w-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{p.reference}</Badge>
                  <span className="text-xs text-gray-400">{p.type ?? "Tipo não identificado"}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {p.bedrooms && <span>{p.bedrooms} quartos</span>}
                  {p.area_built && <span>{p.area_built}m²</span>}
                  {p.price && <span>R$ {Number(p.price).toLocaleString("pt-BR")}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MessageCircle className="h-3 w-3" />
                  {p.source_contact}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(p.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {properties.length > 5 && (
            <p className="text-xs text-center text-amber-600">
              +{properties.length - 5} mais aguardando
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approval modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Revisar Imóvel {selected?.reference}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Photos */}
              {selected.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selected.photos.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`} className="h-32 rounded-lg object-cover flex-shrink-0" />
                  ))}
                </div>
              )}

              {/* Source info */}
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm">
                <MessageCircle className="h-4 w-4 text-green-500" />
                Recebido de <strong>{selected.source_contact}</strong> ({selected.source_phone})
              </div>

              {/* AI confidence */}
              {selected.ai_extracted?.confidence != null && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Confiança IA:</span>
                  <Badge variant="outline">
                    {Math.round((selected.ai_extracted.confidence as number) * 100)}%
                  </Badge>
                </div>
              )}

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Tipo</label>
                  <Input value={editing.type ?? ""} onChange={(e) => setEditing({ ...editing, type: e.target.value })} placeholder="Casa, Apartamento..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Preço (R$)</label>
                  <Input type="number" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Quartos</label>
                  <Input type="number" value={editing.bedrooms ?? ""} onChange={(e) => setEditing({ ...editing, bedrooms: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Suítes</label>
                  <Input type="number" value={editing.suites ?? ""} onChange={(e) => setEditing({ ...editing, suites: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Vagas</label>
                  <Input type="number" value={editing.parking ?? ""} onChange={(e) => setEditing({ ...editing, parking: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Área (m²)</label>
                  <Input type="number" value={editing.area_built ?? ""} onChange={(e) => setEditing({ ...editing, area_built: Number(e.target.value) || null })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Descrição</label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={approving} className="bg-green-600 hover:bg-green-700 text-white">
              {approving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Aprovar e Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
