/**
 * GerarPostsImovel.tsx — Media Kit / galeria de posts gerados para um imóvel.
 * Rota: /gerar-posts/:imovelId
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Copy,
  Trash2,
  ImageIcon,
  Upload,
  Palette,
  Type,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  usePosts,
  useGerarPost,
  useDeletePost,
  useCustomizacoes,
  useGeradorRealtime,
  downloadPost,
  copyText,
} from "@/hooks/useGeradorPosts";
import type { SiteImovel } from "@/types/site";
import type { GeradorPost, FormatoPost, EstiloPost } from "@/types/gerador";
import { FORMATOS_POST, ESTILOS_POST } from "@/types/gerador";
import FormatoSelectorModal from "@/components/gerador/FormatoSelectorModal";
import PostPreviewModal from "@/components/gerador/PostPreviewModal";

/* ─── Fontes disponíveis ─────────────────────────────────────────────────── */

const FONTES = [
  "Montserrat",
  "Poppins",
  "Inter",
  "Playfair Display",
  "Raleway",
  "Roboto",
  "Lato",
  "Oswald",
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GerarPostsImovel() {
  const { imovelId } = useParams<{ imovelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { customizacoes, updateCustomizacoes } = useCustomizacoes();

  // Fetch property info
  const { data: imovel, isLoading: loadingImovel } = useQuery({
    queryKey: ["gerador-imovel-detail", imovelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_imoveis")
        .select("*")
        .eq("id", imovelId!)
        .single();
      if (error) throw error;
      return data as unknown as SiteImovel;
    },
    enabled: Boolean(imovelId),
  });

  // Posts
  const { data: posts, isLoading: loadingPosts } = usePosts(imovelId);
  const gerarPost = useGerarPost();
  const deletePost = useDeletePost();

  // Realtime
  useGeradorRealtime(user?.id, imovelId);

  // Modals
  const [showFormatoModal, setShowFormatoModal] = useState(false);
  const [previewPost, setPreviewPost] = useState<GeradorPost | null>(null);

  /* ─── Handlers ───────────────────────────────────────────────────────── */

  const handleGeneratePost = (formato: FormatoPost, estilo: EstiloPost) => {
    if (!imovelId) return;
    gerarPost.mutate({
      imovel_id: imovelId,
      formato,
      estilo,
      customizacoes,
    });
    setShowFormatoModal(false);
  };

  const handleDownload = async (post: GeradorPost) => {
    const url = post.imagem_url || post.slides_urls?.[0];
    if (!url) return;
    await downloadPost(url, `post-${post.id}.png`);
    toast({ title: "Download iniciado" });
  };

  const handleCopy = async (post: GeradorPost) => {
    const text = [post.legenda_gerada, "", (post.hashtags_geradas ?? []).join(" "), "", post.cta_gerado]
      .filter(Boolean)
      .join("\n");
    await copyText(text);
    toast({ title: "Texto copiado!" });
  };

  const handleDelete = (postId: string) => {
    if (!imovelId) return;
    deletePost.mutate({ postId, imovelId });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/gerador/logo_${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("site-fotos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro ao enviar logo", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("site-fotos").getPublicUrl(filePath);
    updateCustomizacoes({ logo_url: urlData.publicUrl });
    toast({ title: "Logo atualizado" });
  };

  /* ─── Counts ─────────────────────────────────────────────────────────── */

  const totalPosts = posts?.length ?? 0;
  const donePosts = posts?.filter((p) => p.status === "done").length ?? 0;

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gerar-posts")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {loadingImovel ? <Skeleton className="h-7 w-48 inline-block" /> : imovel?.titulo}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {donePosts} post{donePosts !== 1 ? "s" : ""} gerado{donePosts !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            className="bg-[#1E3A5F] hover:bg-[#162D4A] text-white gap-2"
            onClick={() => setShowFormatoModal(true)}
            disabled={gerarPost.isPending}
          >
            {gerarPost.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar novo post
            <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-white">
              AI
            </Badge>
          </Button>
        </div>

        {/* Toolbar — customizacoes */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-white">
          {/* Logo */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Logo
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3">
              <Label>Logo da marca</Label>
              {customizacoes.logo_url && (
                <img src={customizacoes.logo_url} alt="Logo" className="h-10 object-contain rounded" />
              )}
              <Input type="file" accept="image/*" onChange={handleLogoUpload} />
            </PopoverContent>
          </Popover>

          {/* Cor primaria */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="h-4 w-4 rounded-full border" style={{ background: customizacoes.cor_primaria }} />
                Principal
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2">
              <Label>Cor principal</Label>
              <Input
                type="color"
                value={customizacoes.cor_primaria}
                onChange={(e) => updateCustomizacoes({ cor_primaria: e.target.value })}
                className="h-10 cursor-pointer"
              />
            </PopoverContent>
          </Popover>

          {/* Cor secundaria */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="h-4 w-4 rounded-full border" style={{ background: customizacoes.cor_secundaria }} />
                Secundária
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2">
              <Label>Cor secundária</Label>
              <Input
                type="color"
                value={customizacoes.cor_secundaria}
                onChange={(e) => updateCustomizacoes({ cor_secundaria: e.target.value })}
                className="h-10 cursor-pointer"
              />
            </PopoverContent>
          </Popover>

          {/* Cor texto */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Palette className="h-4 w-4" />
                Texto
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2">
              <Label>Cor do texto</Label>
              <Input
                type="color"
                value={customizacoes.cor_texto}
                onChange={(e) => updateCustomizacoes({ cor_texto: e.target.value })}
                className="h-10 cursor-pointer"
              />
            </PopoverContent>
          </Popover>

          {/* Fonte */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Type className="h-4 w-4" />
                {customizacoes.fonte}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2">
              <Label>Fonte</Label>
              <Select
                value={customizacoes.fonte}
                onValueChange={(v) => updateCustomizacoes({ fonte: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
        </div>

        {/* Loading */}
        {loadingPosts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingPosts && totalPosts === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Nenhum post gerado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Clique em "Gerar novo post" para criar seu primeiro post com IA.
            </p>
            <Button
              className="mt-4 bg-[#1E3A5F] hover:bg-[#162D4A] text-white gap-2"
              onClick={() => setShowFormatoModal(true)}
            >
              <Sparkles className="h-4 w-4" />
              Gerar primeiro post
            </Button>
          </div>
        )}

        {/* Gallery */}
        {!loadingPosts && totalPosts > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts!.map((post) => {
              const isProcessing = post.status === "processing";
              const isError = post.status === "error";
              const isDone = post.status === "done";
              const imageUrl = post.imagem_url || post.slides_urls?.[0];

              return (
                <Card
                  key={post.id}
                  className={`overflow-hidden group transition-shadow ${
                    isDone ? "cursor-pointer hover:shadow-md" : ""
                  }`}
                  onClick={() => isDone && setPreviewPost(post)}
                >
                  {/* Image area */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                          <span className="text-sm font-medium text-slate-500 animate-pulse">
                            Gerando...
                          </span>
                        </div>
                      </div>
                    )}

                    {isError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50">
                        <span className="text-sm text-red-500 font-medium">Erro na geração</span>
                        <span className="text-xs text-red-400 px-4 text-center">
                          {post.error_msg || "Tente novamente"}
                        </span>
                      </div>
                    )}

                    {isDone && imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Post gerado"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {isDone && !imageUrl && (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      </div>
                    )}

                    {/* Download overlay */}
                    {isDone && imageUrl && (
                      <button
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(post);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <CardContent className="p-4 space-y-2">
                    {post.legenda_gerada ? (
                      <p className="text-sm text-slate-700 line-clamp-2">{post.legenda_gerada}</p>
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {FORMATOS_POST.find((f) => f.id === post.formato)?.label ?? post.formato}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ESTILOS_POST.find((e) => e.id === post.estilo)?.label ?? post.estilo}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        disabled={!post.legenda_gerada}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(post);
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar texto
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-700 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFormatoModal && (
        <FormatoSelectorModal
          open={showFormatoModal}
          onClose={() => setShowFormatoModal(false)}
          onSelect={handleGeneratePost}
          isLoading={gerarPost.isPending}
        />
      )}

      {previewPost && (
        <PostPreviewModal
          open={Boolean(previewPost)}
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onDownload={() => handleDownload(previewPost)}
          onCopy={() => handleCopy(previewPost)}
        />
      )}
    </AppLayout>
  );
}
