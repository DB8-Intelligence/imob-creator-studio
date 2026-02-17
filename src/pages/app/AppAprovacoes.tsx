import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InboxLayout from "@/components/inbox/InboxLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import {
  CheckCircle,
  XCircle,
  Save,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
} from "lucide-react";

async function fetchPendingApprovals(): Promise<InboxProperty[]> {
  const res = await supabase.functions.invoke("inbox-proxy", { method: "GET" });
  if (res.error) throw new Error(res.error.message);
  const all = res.data as InboxProperty[];
  return all.filter((p) => p.status === "approved" || p.status === "editing");
}

async function publishProperty(id: string): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "POST", _path: `/properties/${id}/publish` },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.status === 403) throw new Error("Créditos insuficientes");
}

async function rejectProperty(id: string): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "PATCH", _path: `/properties/${id}`, status: "rejected" },
  });
  if (res.error) throw new Error(res.error.message);
}

const AppAprovacoes = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InboxProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState("Agende sua visita");
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchPendingApprovals();
      setItems(data);
      if (data.length > 0) {
        setCaption((data[0] as any).caption || "");
        setCta((data[0] as any).cta || "Agende sua visita");
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const current = items[currentIdx];

  const selectItem = (idx: number) => {
    setCurrentIdx(idx);
    const item = items[idx];
    setCaption((item as any).caption || "");
    setCta((item as any).cta || "Agende sua visita");
  };

  const handleApprove = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      await publishProperty(current.id);
      toast({ title: "✅ Post aprovado e enviado para publicação!" });
      navigate("/app/inbox");
    } catch (err: any) {
      toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      await rejectProperty(current.id);
      toast({ title: "Post rejeitado" });
      await loadItems();
      setCurrentIdx(0);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InboxLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
            <p className="text-sm text-muted-foreground mt-1">Revise e publique seus posts</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/inbox")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Inbox
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <CheckCircle className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">Nenhum post aguardando aprovação</p>
            <p className="text-xs mt-1">Quando houver posts prontos, eles aparecerão aqui.</p>
          </div>
        )}

        {!loading && current && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">Preview das imagens</p>
                {current.images?.[0] ? (
                  <img
                    src={current.images[0]}
                    alt={current.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                {/* Item navigation */}
                {items.length > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentIdx === 0}
                      onClick={() => selectItem(currentIdx - 1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentIdx + 1} de {items.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentIdx === items.length - 1}
                      onClick={() => selectItem(currentIdx + 1)}
                    >
                      Próximo <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit form */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">{current.title}</h2>
                <p className="text-sm text-muted-foreground">{current.description}</p>

                <div>
                  <Label>Legenda (editável)</Label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={6}
                    className="mt-1"
                    placeholder="Legenda gerada pela IA..."
                  />
                </div>

                <div>
                  <Label>CTA (editável)</Label>
                  <Input
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="mt-1"
                    placeholder="Ex: Agende sua visita"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar e Publicar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleReject}
                    disabled={submitting}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button variant="outline" className="flex-1" disabled>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </InboxLayout>
  );
};

export default AppAprovacoes;
