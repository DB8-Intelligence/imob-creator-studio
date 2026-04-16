import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, Upload, Download, AlertCircle, CheckCircle2, Coins } from "lucide-react";
import { consumeCredits } from "@/services/userPlanApi";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import { CREDIT_COSTS } from "@/lib/plan-rules";

interface ImageData {
  file: File;
  dataUrl: string;
  base64: string;
  name: string;
}

const UPSCALE_CREDIT_COST = CREDIT_COSTS.upscale_basic;

export default function UpscaleImagePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: planInfo, refetch: refetchPlan } = useUserPlan();

  const [image, setImage] = useState<ImageData | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(0);

  const credits = planInfo?.credits_remaining ?? null;

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage({ file, dataUrl, base64: dataUrl.split(",")[1], name: file.name });
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const canUpscale =
    image && !loading && credits !== null && credits >= UPSCALE_CREDIT_COST;

  const upscale = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Consume credits first
      await consumeCredits(UPSCALE_CREDIT_COST);
      setCreditsUsed((prev) => prev + UPSCALE_CREDIT_COST);

      // Call image-restoration edge function with an upscale-specific prompt
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("image-restoration", {
        body: {
          imageBase64: image.dataUrl,
          style: "moderno",
          environmentType: "residencial",
          customPrompt:
            "DO NOT add any furniture or change the room. Instead, enhance this real estate photo: improve resolution and sharpness, correct lighting and white balance, reduce noise and compression artifacts, enhance colors naturally. The result must look like the SAME photo but in higher quality. Do NOT alter the room contents in any way.",
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (!data?.success) throw new Error(data?.error || "Erro ao processar upscale");

      setResult(data.stagedImageUrl);
      await refetchPlan();
    } catch (err) {
      setError(
        (err as Error).message || "Erro ao processar upscale. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }, [image, refetchPlan]);

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `upscale_${image?.name ?? "imagem"}.png`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card to-muted/40 p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-3">0,3 créditos / imagem</Badge>
              <h1 className="text-3xl font-display font-bold text-foreground">Upscale de Imagem</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Amplie e melhore a resolução de fotos de imóveis com inteligência artificial. Ideal para anúncios, impressos e redes sociais.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 min-w-[200px]">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3" /> Seus créditos
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {credits !== null ? credits.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">disponíveis</p>
            </div>
          </div>
        </section>

        {/* Upload */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ZoomIn className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Selecione a imagem</span>
              <Badge variant="outline" className="ml-auto text-xs">PNG · JPG · WEBP</Badge>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[220px] ${
                drag
                  ? "border-accent bg-accent/5"
                  : image
                  ? "border-accent/40 bg-muted/20"
                  : "border-border hover:border-accent/40 hover:bg-muted/10"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            >
              {image ? (
                <div className="relative w-full h-[220px]">
                  <img
                    src={image.dataUrl}
                    alt="Original"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-background/80 text-foreground border border-border">
                    clique para trocar
                  </Badge>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Clique ou arraste a imagem aqui</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {credits !== null && credits < UPSCALE_CREDIT_COST && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Créditos insuficientes. Você precisa de {UPSCALE_CREDIT_COST} crédito para fazer o upscale.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={upscale}
              disabled={!canUpscale}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processando upscale...
                </>
              ) : (
                <>
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Fazer Upscale — 0,3 créditos
                </>
              )}
            </Button>

            {!image && (
              <p className="text-center text-xs text-muted-foreground">
                Envie uma imagem para continuar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="border-accent/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Upscale concluído</span>
                <Badge variant="outline" className="ml-auto text-xs text-green-600 border-green-500/30">
                  −{UPSCALE_CREDIT_COST} créditos
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Original</p>
                  <img
                    src={image?.dataUrl}
                    alt="Original"
                    className="w-full rounded-xl border border-border object-cover"
                    style={{ maxHeight: 280 }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Upscaled</p>
                  <img
                    src={result}
                    alt="Upscaled"
                    className="w-full rounded-xl border border-accent/30 object-cover"
                    style={{ maxHeight: 280 }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={downloadResult}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar imagem
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setImage(null); setResult(null); }}
                >
                  Nova imagem
                </Button>
              </div>

              {creditsUsed > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Total consumido nesta sessão: {creditsUsed.toFixed(1)} crédito(s)
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
