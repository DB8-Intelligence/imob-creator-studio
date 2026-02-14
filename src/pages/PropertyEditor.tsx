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
import InboxLayout from "@/components/inbox/InboxLayout";
import type { InboxProperty } from "@/components/inbox/PropertyCard";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

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

const PropertyEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<InboxProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("Agende sua visita");
  const [images, setImages] = useState<string[]>([]);

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
        title,
        description,
        images,
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
            </CardContent>
          </Card>
        </div>

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
        </div>
      </div>
    </InboxLayout>
  );
};

export default PropertyEditor;
