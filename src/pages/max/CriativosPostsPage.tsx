/**
 * CriativosPostsPage.tsx — Hub de Criativos (Legendas + Posts)
 *
 * Layout: Gerador (esquerda 35%) + Resultados (direita 65%)
 * Abaixo: Galeria de posts gerados.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Palette, Sparkles, Loader2, FileText, Video, LayoutGrid, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaptionGenerator, type CaptionRequest } from "@/hooks/useCaptionGenerator";
import { CaptionResultCards } from "@/components/criativos/CaptionResultCards";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-slate-500/10 text-slate-500",
  aprovado: "bg-emerald-500/10 text-emerald-500",
  agendado: "bg-blue-500/10 text-blue-500",
  publicado: "bg-violet-500/10 text-violet-500",
};

export default function CriativosPostsPage() {
  const navigate = useNavigate();
  const { result, isGenerating, generate, regenerateField, savedPosts } = useCaptionGenerator();

  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [postType, setPostType] = useState<CaptionRequest["postType"]>("feed");
  const [objetivo, setObjetivo] = useState<CaptionRequest["objetivo"]>("venda");
  const [tom, setTom] = useState<CaptionRequest["tom"]>("profissional");
  const [promptExtra, setPromptExtra] = useState("");
  const [incluirEmojis, setIncluirEmojis] = useState(true);
  const [incluirHashtags, setIncluirHashtags] = useState(true);
  const [incluirCta, setIncluirCta] = useState(true);

  const currentRequest: CaptionRequest = {
    propertyName, postType, objetivo, tom, promptExtra,
    incluirEmojis, incluirHashtags, incluirCta,
  };

  const handleGenerate = () => {
    if (!propertyName.trim()) return;
    generate(currentRequest);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1300px]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Criativos</h1>
            <p className="text-sm text-muted-foreground">Gere legendas, hashtags e CTA com IA para seus imóveis.</p>
          </div>
        </div>

        {/* Top tabs for section navigation */}
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts" className="gap-1.5"><FileText className="w-4 h-4" />Posts & Legendas</TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5" onClick={() => navigate("/criativos/videos")}><Video className="w-4 h-4" />Vídeos</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5" onClick={() => navigate("/criativos/templates")}><LayoutGrid className="w-4 h-4" />Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-6">
            {/* 2-column generator */}
            <div className="grid lg:grid-cols-[380px_1fr] gap-6">
              {/* Left: Generator panel */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Gerador Rápido
                  </h3>

                  <div>
                    <Label>Imóvel</Label>
                    <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="Buscar imóvel..." />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo de post</Label>
                      <Select value={postType} onValueChange={(v) => setPostType(v as CaptionRequest["postType"])}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feed">Feed</SelectItem>
                          <SelectItem value="stories">Stories</SelectItem>
                          <SelectItem value="reels">Reels</SelectItem>
                          <SelectItem value="carrossel">Carrossel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Objetivo</Label>
                      <Select value={objetivo} onValueChange={(v) => setObjetivo(v as CaptionRequest["objetivo"])}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venda">Venda</SelectItem>
                          <SelectItem value="aluguel">Aluguel</SelectItem>
                          <SelectItem value="engajamento">Engajamento</SelectItem>
                          <SelectItem value="autoridade">Autoridade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Tom</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(["luxo", "profissional", "informal", "urgencia", "emocional"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTom(t)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border text-xs font-medium transition-all capitalize",
                            tom === t ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Prompt adicional</Label>
                    <Textarea value={promptExtra} onChange={(e) => setPromptExtra(e.target.value)} placeholder="Instruções extras para a IA..." rows={2} className="text-xs" />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Incluir emojis</Label>
                      <Switch checked={incluirEmojis} onCheckedChange={setIncluirEmojis} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Incluir hashtags</Label>
                      <Switch checked={incluirHashtags} onCheckedChange={setIncluirHashtags} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Incluir CTA</Label>
                      <Switch checked={incluirCta} onCheckedChange={setIncluirCta} />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!propertyName.trim() || isGenerating}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGenerating ? "Gerando..." : "Gerar Pacote Completo"}
                  </Button>
                </CardContent>
              </Card>

              {/* Right: Results */}
              <div>
                {!result && !isGenerating && (
                  <div className="rounded-2xl border border-dashed border-border p-16 text-center h-full flex flex-col items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <p className="font-medium text-foreground">Pronto para gerar</p>
                    <p className="text-sm text-muted-foreground mt-1">Selecione um imóvel e clique em "Gerar Pacote Completo".</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="rounded-2xl border border-border p-16 text-center h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                    <p className="font-medium text-foreground">Gerando conteúdo com IA...</p>
                    <p className="text-sm text-muted-foreground mt-1">Legenda + Hashtags + CTA + Stories</p>
                  </div>
                )}

                {result && !isGenerating && (
                  <CaptionResultCards
                    result={result}
                    onRegenerateField={(field) => regenerateField(field, currentRequest)}
                  />
                )}
              </div>
            </div>

            {/* Gallery of saved posts */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Posts gerados</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground text-sm truncate">{post.propertyName}</p>
                        <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[post.status])}>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.legenda}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{post.postType}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
