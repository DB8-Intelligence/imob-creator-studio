import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/app/AppLayout";
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
  FileText
} from "lucide-react";

const Export = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [platform, setPlatform] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [scheduleComplete, setScheduleComplete] = useState(false);

  const handleDownload = (format: string) => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
    }, 1500);
  };

  const handleSchedule = () => {
    if (!date || !platform) return;
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setScheduleComplete(true);
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Exportar Criativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Baixe ou agende a publicação do seu criativo
          </p>
        </div>

        {/* Preview Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 aspect-square bg-muted rounded-xl flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Casa Moderna no Alphaville</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">Feed 1080×1080</Badge>
                  <Badge variant="secondary">Venda</Badge>
                  <Badge variant="secondary">Estilo Express</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  5 suítes · 630m² · R$ 3.200.000
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Marca: <span className="text-foreground font-medium">DB8 Imobiliária</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                Baixar Arquivo
              </CardTitle>
              <CardDescription>
                Escolha o formato de exportação
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
                  <p className="text-xs text-muted-foreground">Ideal para redes sociais</p>
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

              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => handleDownload("pdf")}
                disabled={isDownloading}
              >
                <FileText className="w-8 h-8 mr-4 text-red-500" />
                <div className="text-left">
                  <p className="font-medium">PDF para Impressão</p>
                  <p className="text-xs text-muted-foreground">300 DPI, alta resolução</p>
                </div>
              </Button>

              {isDownloading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Preparando download...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent" />
                Agendar Publicação
              </CardTitle>
              <CardDescription>
                Programe para publicar automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduleComplete ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Agendado com Sucesso!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seu criativo será publicado em {date && format(date, "dd/MM/yyyy", { locale: ptBR })} às {time}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setScheduleComplete(false)}
                  >
                    Agendar outro
                  </Button>
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
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            Instagram
                          </div>
                        </SelectItem>
                        <SelectItem value="facebook">
                          <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4" />
                            Facebook
                          </div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Ambos
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
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
                      💡 <strong>Dica:</strong> Os melhores horários para engajamento no Instagram são entre 10h-12h e 18h-20h.
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleSchedule}
                    disabled={!date || !platform || isScheduling}
                  >
                    {isScheduling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
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

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/editor")}>
            Voltar ao Editor
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Novo Criativo
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Export;
