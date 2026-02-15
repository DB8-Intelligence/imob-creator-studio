import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge, { type PropertyStatus } from "@/components/inbox/StatusBadge";
import ImageCarousel from "@/components/inbox/ImageCarousel";
import EditorForm from "@/components/inbox/EditorForm";
import PublishPreviewModal from "@/components/inbox/PublishPreviewModal";
import InboxLayout from "@/components/inbox/InboxLayout";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import TemplateSelect from "@/components/brand/TemplateSelect";
import { Label } from "@/components/ui/label";
import { useUserPlan, useDecrementCredit } from "@/hooks/useUserPlan";
import { fetchUserPlan } from "@/services/userPlanApi";

// --- API helpers ---

async function fetchAllProperties(): Promise<InboxProperty[]> {
  const res = await supabase.functions.invoke("inbox-proxy", { method: "GET" });
  if (res.error) throw new Error(res.error.message);
  return res.data as InboxProperty[];
}

async function patchProperty(id: string, body: Record<string, unknown>): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "PATCH", _path: `/properties/${id}`, ...body },
  });
  if (res.error) throw new Error(res.error.message);
}

interface PublishResponse {
  image_path?: string;
  status?: string;
  message?: string;
}

async function publishProperty(id: string): Promise<PublishResponse> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "POST", _path: `/properties/${id}/publish` },
  });
  if (res.error) throw new Error(res.error.message);
  return res.data as PublishResponse;
}

async function confirmPublication(id: string): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "POST", _path: `/properties/${id}/confirm-publication` },
  });
  if (res.error) throw new Error(res.error.message);
}

// --- Component ---

const PropertyEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<InboxProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("Agende sua visita");
  const [images, setImages] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  // Publish preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [generatedArtUrl, setGeneratedArtUrl] = useState<string | null>(null);

  const statusPatched = useRef(false);

  // Fetch property
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const all = await fetchAllProperties();
        const found = all.find((p) => p.id === id);
        if (!found) throw new Error("Imóvel não encontrado");
        if (cancelled) return;

        setProperty(found);
        setTitle(found.title || "");
        setDescription(found.description || "");
        setImages(found.images || []);
        setTemplateId((found as any).template_id || undefined);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Auto-patch status to "editing" if pending
  useEffect(() => {
    if (!property || statusPatched.current) return;
    if (property.status === "pending" && id) {
      statusPatched.current = true;
      patchProperty(id, { status: "editing" }).then(() => {
        setProperty((prev) => prev ? { ...prev, status: "editing" as PropertyStatus } : prev);
      }).catch(() => {/* silent */});
    }
  }, [property, id]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await patchProperty(id, { title, description, images, template_id: templateId, status: "editing" });
      toast({ title: "Alterações salvas com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 1: Generate art and show preview
  const handlePublish = async () => {
    if (!id) return;
    setIsPublishing(true);
    setGeneratedArtUrl(null);
    try {
      const result = await publishProperty(id);
      setProperty((prev) => prev ? { ...prev, status: (result.status || "approved") as PropertyStatus } : prev);
      setGeneratedArtUrl(result.image_path || null);
      setShowPreview(true);
    } catch (err: any) {
      toast({ title: "Erro ao gerar arte", description: err.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Step 2: Confirm publication → validate credits, send to n8n, then poll
  const { data: userPlan } = useUserPlan();
  const decrementCredit = useDecrementCredit();

  const noCredits = userPlan?.user_plan === "credits" && (userPlan?.credits_remaining ?? 0) <= 0;

  const handleConfirmPublication = async () => {
    if (!id) return;

    // Validate credits before publishing
    try {
      const freshPlan = await fetchUserPlan();
      if (freshPlan.user_plan === "credits" && freshPlan.credits_remaining <= 0) {
        toast({ title: "Sem créditos", description: "Adquira mais créditos para publicar.", variant: "destructive" });
        return;
      }
    } catch {
      // If we can't check, proceed anyway
    }

    setIsConfirming(true);
    try {
      await confirmPublication(id);

      // Decrement credit after successful confirmation
      if (userPlan?.user_plan === "credits") {
        decrementCredit.mutate();
      }

      toast({ title: "Post enviado para publicação automática" });
      setShowPreview(false);
      navigate("/posts", { state: { pollingId: id } });
    } catch (err: any) {
      toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
    } finally {
      setIsConfirming(false);
    }
  };

  const isApprovedOrPublished = property?.status === "approved" || property?.status === "published";

  if (isLoading) {
    return (
      <InboxLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </InboxLayout>
    );
  }

  if (error || !property) {
    return (
      <InboxLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-destructive font-medium mb-2">Erro ao carregar imóvel</p>
          <p className="text-sm text-muted-foreground mb-4">{error || "Imóvel não encontrado"}</p>
          <Button variant="outline" onClick={() => navigate("/inbox")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Inbox
          </Button>
        </div>
      </InboxLayout>
    );
  }

  return (
    <InboxLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/inbox")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Inbox
            </Button>
            <StatusBadge status={property.status} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Images */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Imagens</h3>
              <ImageCarousel
                images={images}
                onReorder={setImages}
                onRemove={handleRemoveImage}
              />
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Informações</h3>
              <EditorForm
                title={title}
                description={description}
                cta={cta}
                onChangeTitle={setTitle}
                onChangeDescription={setDescription}
                onChangeCta={setCta}
              />
              <div className="mt-4 space-y-2">
                <Label>Template (Brand Kit)</Label>
                <TemplateSelect value={templateId} onChange={(v) => setTemplateId(v)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No credits warning */}
        {noCredits && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Sem créditos disponíveis. Adquira mais créditos para publicar.
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => navigate("/inbox")}>
            Voltar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Salvar alterações</>
            )}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || isApprovedOrPublished || noCredits}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPublishing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando arte...</>
            ) : isApprovedOrPublished ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Aprovado</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar e Postar</>
            )}
          </Button>
        </div>
      </div>

      {/* Publish Preview Modal */}
      <PublishPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmPublication}
        isConfirming={isConfirming}
        imageUrl={generatedArtUrl}
        propertyTitle={title}
      />
    </InboxLayout>
  );
};

export default PropertyEditor;
