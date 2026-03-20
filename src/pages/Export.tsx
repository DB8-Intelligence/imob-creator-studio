import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toPng, toJpeg } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Download,
  Calendar as CalendarIcon,
  Instagram,
  Facebook,
  Share2,
  Check,
  Clock,
  ImageIcon,
  FileImage,
} from "lucide-react";

interface ExportState {
  creativeId?: string;
  exportedUrl?: string;
  formData?: {
    title: string;
    subtitle: string;
    price: string;
    cta: string;
  };
  coverUrl?: string | null;
  caption?: string;
}

const Export = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const state = (location.state as ExportState) ?? {};
  const { creativeId, exportedUrl, formData, coverUrl, caption } = state;

  const creativeRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [platform, setPlatform] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [scheduleComplete, setScheduleComplete] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date>();

  const title = formData?.title ?? "Criativo Imobiliário";
  const subtitle = formData?.subtitle ?? "";
  const price = formData?.price ?? "";
  const cta = formData?.cta ?? "Agende sua Visita";

  // Download: prefer the real AI-generated image, fallback to DOM capture
  const handleDownload = async (fmt: "png" | "jpg") => {
    setIsDownloading(true);
    try {
      if (exportedUrl) {
        const res = await fetch(exportedUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `criativo-${Date.now()}.${fmt}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else if (creativeRef.current) {
        const exportFn = fmt === "png" ? toPng : toJpeg;
        const dataUrl = await exportFn(creativeRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: fmt === "jpg" ? 0.92 : undefined,
        });
        const link = document.createElement("a");
        link.download = `criativo-${Date.now()}.${fmt}`;
        link.href = dataUrl;
        link.click();
      }
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
      toast({ title: "Download iniciado!" });
    } catch (err) {
      console.error("Export failed:", err);
      toast({ title: "Erro ao baixar arquivo", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  // Schedule: save to Supabase (update existing or create new record)
  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!date || !platform || !user) throw new Error("Dados incompletos");

      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);

      if (creativeId) {
        const { error } = await supabase
          .from("creatives")
          .update({ scheduled_at: scheduledDate.toISOString(), status: "scheduled" })
          .eq("id", creativeId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("creatives")
          .insert({
            user_id: user.id,
            name: title,
            format: "feed_square",
            status: "scheduled",
            scheduled_at: scheduledDate.toISOString(),
            caption: caption ?? null,
            exported_url: exportedUrl ?? null,
          });
        if (error) throw error;
      }

      return scheduledDate;
    },
    onSuccess: (scheduledDate) => {
      setScheduledAt(scheduledDate);
      setScheduleComplete(true);
      toast({ title: "Publicação agendada com sucesso!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao agendar", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Exportar Criativo</h1>
          <p className="text-muted-foreground mt-1">Baixe ou agende a publicação do seu criativo</p>
        </div>

        {/* Creative Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {exportedUrl ? (
                  <img
                    src={exportedUrl}
                    alt={title}
                    className="w-[320px] aspect-square object-cover rounded-xl shadow-elevated"
                  />
                ) : (
                  <div
                    ref={creativeRef}
                    className="w-[320px] aspect-square bg-card rounded-xl shadow-elevated p-6 flex flex-col justify-between text-card-foreground overflow-hidden"
                  >
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt="Capa"
                        className="h-[45%] w-full object-cover rounded-lg"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="h-[45%] bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold mb-1">{title}</h2>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                      <p className="text-lg font-bold text-accent mt-2">{price}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-accent text-accent-foreground font-semibold px-4 py-2 rounded-full text-sm">
                        {cta}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">Feed 1080×1080</Badge>
                  {exportedUrl && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">IA Gerada</Badge>
                  )}
                  {price && <Badge variant="secondary">{price}</Badge>}
                </div>
                {subtitle && <p className="text-sm text-muted-foreground mt-3">{subtitle}</p>}
                {caption && (
                  <div className="mt-4 bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Legenda:</p>
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-body">{caption}</pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                Baixar Arquivo
              </CardTitle>
              <CardDescription>
                {exportedUrl ? "Baixe a imagem gerada pela IA" : "Escolha o formato de exportação"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleDownload("png")}
                disabled={isDownloading}
              >
                <FileImage className="w-8 h-8 mr-4 text-accent" />
                <div className="text-left">
                  <p className="font-medium">PNG Alta Qualidade</p>
                  <p className="text-xs text-muted-foreground">Ideal para redes sociais · 2x resolução</p>
                </div>
                {downloadComplete && <Check className="w-5 h-5 ml-auto text-green-500" />}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleDownload("jpg")}
                disabled={isDownloading}
              >
                <FileImage className="w-8 h-8 mr-4 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">JPG Comprimido</p>
                  <p className="text-xs text-muted-foreground">Menor tamanho de arquivo</p>
                </div>
              </Button>

              {isDownloading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                  <span className="ml-2 text-sm text-muted-foreground">Preparando download...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent" />
                Agendar Publicação
              </CardTitle>
              <CardDescription>Programe para publicar automaticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduleComplete && scheduledAt ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Agendado com Sucesso!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Publicação em {format(scheduledAt, "dd/MM/yyyy", { locale: ptBR })} às {time}
                  </p>
                  <div className="flex gap-2 mt-4 justify-center">
                    <Button variant="outline" onClick={() => setScheduleComplete(false)}>
                      Agendar outro
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/posts")}>
                      Ver publicações
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Plataforma</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">
                          <div className="flex items-center gap-2"><Instagram className="w-4 h-4" />Instagram</div>
                        </SelectItem>
                        <SelectItem value="facebook">
                          <div className="flex items-center gap-2"><Facebook className="w-4 h-4" />Facebook</div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2"><Share2 className="w-4 h-4" />Ambos</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Dica:</strong> Os melhores horários para engajamento no Instagram são entre 10h–12h e 18h–20h.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => scheduleMutation.mutate()}
                    disabled={!date || !platform || scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Agendar Publicação
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/editor")}>Voltar ao Editor</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Novo Criativo</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Export;
