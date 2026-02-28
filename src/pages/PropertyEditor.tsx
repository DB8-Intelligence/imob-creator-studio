import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge, { type PropertyStatus } from "@/components/inbox/StatusBadge";
import ImageCarousel from "@/components/inbox/ImageCarousel";
import EditorForm, { type EditorFormData } from "@/components/inbox/EditorForm";

import InboxLayout from "@/components/inbox/InboxLayout";
import CreditsBanner from "@/components/inbox/CreditsBanner";
import ArtGenerationPanel from "@/components/inbox/ArtGenerationPanel";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import { ArrowLeft, Save, Loader2, CheckCircle2, Building2 } from "lucide-react";
import TemplateSelect from "@/components/brand/TemplateSelect";
import { Label } from "@/components/ui/label";
import { useUserPlan } from "@/hooks/useUserPlan";

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

// --- Component ---

interface PublishResult {
  instagram_url?: string;
  final_image?: string;
}

async function publishProperty(id: string): Promise<PublishResult> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "POST", _path: `/properties/${id}/publish` },
  });

  // supabase client sets error for non-2xx; check if it's a 403 (no credits)
  if (res.error) {
    const msg = res.error.message || "";
    if (msg.includes("403") || (res.data && typeof res.data === "object" && res.data.status === 403)) {
      throw new CreditError("Sem créditos disponíveis. Adquira mais créditos para publicar.");
    }
    throw new Error(msg || "Erro ao publicar");
  }

  return (res.data || {}) as PublishResult;
}

class CreditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditError";
  }
}

// --- Component ---

const PropertyEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: userPlan } = useUserPlan();

  const [property, setProperty] = useState<InboxProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [formData, setFormData] = useState<EditorFormData>({
    title: "",
    description: "",
    cta: "Agende sua visita",
    property_type: "apartamento",
    property_standard: "medio",
    state: "",
    city: "",
    neighborhood: "",
    investment_value: "",
    built_area_m2: "",
    highlights: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
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
        setFormData({
          title: found.title || "",
          description: found.description || "",
          cta: "Agende sua visita",
          property_type: found.property_type || "apartamento",
          property_standard: found.property_standard || "medio",
          state: (found as any).state || "",
          city: found.city || "",
          neighborhood: found.neighborhood || "",
          investment_value: found.investment_value != null ? String(found.investment_value) : "",
          built_area_m2: found.built_area_m2 != null ? String(found.built_area_m2) : "",
          highlights: found.highlights || "",
        });
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
      await patchProperty(id, {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        property_standard: formData.property_standard,
        state: formData.state,
        city: formData.city,
        neighborhood: formData.neighborhood,
        investment_value: formData.investment_value ? Number(formData.investment_value) : null,
        built_area_m2: formData.built_area_m2 ? Number(formData.built_area_m2) : null,
        highlights: formData.highlights,
        images,
        template_id: templateId,
        status: "editing",
      });
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

  // Single-step publish: POST /properties/{id}/publish
  const handlePublish = async () => {
    if (!id) return;

    // Client-side credit validation
    if (userPlan?.user_plan === "credits" && (userPlan.credits_remaining ?? 0) <= 0) {
      toast({ title: "Sem créditos", description: "Seus créditos acabaram. Adquira mais créditos para publicar.", variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    setGeneratedArtUrl(null);
    try {
      const result = await publishProperty(id);
      setProperty((prev) => prev ? { ...prev, status: "published" as PropertyStatus, instagram_url: result.instagram_url, final_image: result.final_image } : prev);
      if (result.final_image) setGeneratedArtUrl(result.final_image);
      toast({ title: "Post publicado com sucesso!" });
      navigate("/posts", { state: { pollingId: id } });
    } catch (err: any) {
      if (err instanceof CreditError) {
        toast({ title: "Sem créditos", description: err.message, variant: "destructive" });
      } else {
        toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsPublishing(false);
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

        <CreditsBanner userPlan={userPlan} />

        <div className="grid lg:grid-cols-3 gap-6">
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

          {/* Template */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Template</h3>
              <div className="space-y-2">
                <Label>Template (Brand Kit)</Label>
                <TemplateSelect value={templateId} onChange={(v) => setTemplateId(v)} />
              </div>
            </CardContent>
          </Card>

          {/* Art Generation */}
          <div className="lg:row-span-2">
            <ArtGenerationPanel
              propertyId={id!}
              images={images}
              title={formData.title}
              description={formData.description}
              brandId={undefined}
              templateId={templateId}
            />
          </div>
        </div>

        {/* Dados Inteligentes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Dados Inteligentes do Imóvel
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Esses dados alimentam a IA para gerar legendas e criativos otimizados
            </p>
            <EditorForm
              data={formData}
              onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />
          </CardContent>
        </Card>

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
            disabled={isPublishing || isApprovedOrPublished}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPublishing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</>
            ) : isApprovedOrPublished ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Publicado</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar e Postar</>
            )}
          </Button>
        </div>
      </div>
    </InboxLayout>
  );
};

export default PropertyEditor;
