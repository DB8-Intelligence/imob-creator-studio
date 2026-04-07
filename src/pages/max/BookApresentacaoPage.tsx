/**
 * BookApresentacaoPage.tsx — Book Agente (MAX)
 *
 * Seções: Book Atual + Configurar Book + Gerar PDF + Link Público
 */
import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Download, Share2, RefreshCw, Upload, Sparkles,
  QrCode, Eye, Link2, FileDown, Loader2, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function BookApresentacaoPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);
  const [template, setTemplate] = useState("moderno");
  const [linkPublico, setLinkPublico] = useState(true);
  const [slogan, setSlogan] = useState("Seu imóvel dos sonhos está mais perto do que você imagina.");
  const [bio, setBio] = useState("");
  const [showCreci, setShowCreci] = useState(true);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setGenerating(false);
    setGenerated(true);
    toast({ title: "Book gerado com sucesso!" });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1100px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Book Agente</h1>
              <p className="text-sm text-muted-foreground">PDF profissional + portfólio + link público</p>
            </div>
          </div>
          <div className="flex gap-2">
            {generated && <Button variant="outline"><Eye className="w-4 h-4 mr-2" />Ver Book Atual</Button>}
            <Button onClick={handleGenerate} disabled={generating} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
              {generating ? "Gerando..." : "Gerar Novo Book"}
            </Button>
          </div>
        </div>

        {/* Book atual */}
        {generated && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6 flex-wrap">
                {/* Preview thumbs */}
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-20 h-28 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">Pág {i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-emerald-500 bg-emerald-500/10 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Gerado</Badge>
                    <span className="text-xs text-muted-foreground">05 abr 2026 &middot; 8 imóveis</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Download className="w-3.5 h-3.5 mr-1.5" />Baixar PDF</Button>
                    <Button size="sm" variant="outline"><Share2 className="w-3.5 h-3.5 mr-1.5" />Compartilhar</Button>
                    <Button size="sm" variant="ghost"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Capa e Identidade */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Capa e Identidade</h3>
              <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Foto profissional do corretor</p>
                <Button variant="outline" size="sm" className="mt-2">Upload</Button>
              </div>
              <div>
                <Label>Slogan</Label>
                <Input value={slogan} onChange={(e) => setSlogan(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar CRECI?</Label>
                <Switch checked={showCreci} onCheckedChange={setShowCreci} />
              </div>
              <div>
                <Label>Template visual</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="luxo">Luxo</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bio e Conteúdo */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Conteúdo do Book</h3>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Bio profissional</Label>
                  <Button size="sm" variant="ghost" className="text-xs h-7"><Sparkles className="w-3 h-3 mr-1" />Gerar com IA</Button>
                </div>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Sua apresentação profissional..." rows={4} />
              </div>
              <div>
                <Label>Especialidades</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Residencial", "Comercial", "Lançamentos", "Luxo", "Interior"].map((e) => (
                    <Badge key={e} variant="secondary" className="text-xs cursor-pointer hover:bg-accent/10">{e}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link público */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Link Público do Book</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-accent">imobcreatorai.com.br/book/corretor-nome</span>
                    <Badge variant="secondary" className="text-[10px]">42 acessos</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Link ativo</Label>
                  <Switch checked={linkPublico} onCheckedChange={setLinkPublico} />
                </div>
                <Button variant="outline" size="sm"><Share2 className="w-3.5 h-3.5 mr-1.5" />Copiar Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
