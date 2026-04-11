/**
 * PostPreviewModal.tsx — Full-screen preview dialog (max-w-5xl, 2 columns)
 *   Left:  Instagram simulation (header, image/carrossel, actions, caption)
 *   Right: Actions, caption editing, hashtags, quick actions, navigation
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Sparkles,
  CalendarPlus,
  Smartphone,
  GripVertical,
  X,
  Plus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GeradorPost {
  id: string;
  imovel_id: string;
  formato: "post_instagram" | "story_instagram" | "carrossel_post" | "carrossel_story";
  estilo: string;
  legenda_gerada: string;
  hashtags: string[];
  imagem_url: string;
  slides?: string[]; // carrossel slides
  created_at: string;
}

export interface PostPreviewModalProps {
  open: boolean;
  onClose: () => void;
  post: GeradorPost;
  corretorNome: string;
  corretorFoto?: string;
  posts: GeradorPost[]; // for navigation between posts
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CAPTION_MAX = 2200;

function isCarrossel(formato: string) {
  return formato === "carrossel_post" || formato === "carrossel_story";
}

function isStory(formato: string) {
  return formato === "story_instagram" || formato === "carrossel_story";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PostPreviewModal({
  open,
  onClose,
  post,
  corretorNome,
  corretorFoto,
  posts,
}: PostPreviewModalProps) {
  /* ── State ────────────────────────────────────────────────────── */
  const [currentPostId, setCurrentPostId] = useState(post.id);
  const [legenda, setLegenda] = useState(post.legenda_gerada);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags);
  const [newHashtag, setNewHashtag] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePost = posts.find((p) => p.id === currentPostId) ?? post;
  const activeIdx = posts.findIndex((p) => p.id === currentPostId);

  /* Sync when post prop changes */
  useEffect(() => {
    setCurrentPostId(post.id);
    setLegenda(post.legenda_gerada);
    setHashtags(post.hashtags);
    setSlideIdx(0);
  }, [post]);

  /* When navigating between posts */
  const navigateTo = useCallback(
    (id: string) => {
      const p = posts.find((x) => x.id === id);
      if (!p) return;
      setCurrentPostId(id);
      setLegenda(p.legenda_gerada);
      setHashtags(p.hashtags);
      setSlideIdx(0);
    },
    [posts]
  );

  /* ── Debounced save (placeholder — wire to supabase) ──────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // TODO: supabase update legenda + hashtags for activePost.id
      // e.g. supabase.from('gerador_posts').update({legenda_gerada: legenda, hashtags}).eq('id', activePost.id)
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [legenda, hashtags, activePost.id]);

  /* ── Hashtag management ───────────────────────────────────────── */

  const removeHashtag = (idx: number) => {
    setHashtags((prev) => prev.filter((_, i) => i !== idx));
  };

  const addHashtag = () => {
    const tag = newHashtag.trim().replace(/^#/, "");
    if (!tag) return;
    setHashtags((prev) => [...prev, `#${tag}`]);
    setNewHashtag("");
  };

  /* ── Copy / Download ──────────────────────────────────────────── */

  const handleCopyText = async () => {
    const text = `${legenda}\n\n${hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = activePost.imagem_url;
    link.download = `post_${activePost.id}.png`;
    link.click();
  };

  /* ── Carrossel slides ─────────────────────────────────────────── */
  const slides = activePost.slides ?? [activePost.imagem_url];
  const totalSlides = slides.length;

  const prevSlide = () => setSlideIdx((i) => Math.max(0, i - 1));
  const nextSlide = () => setSlideIdx((i) => Math.min(totalSlides - 1, i + 1));

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
          {/* ─── Left Column — Instagram Preview (55%) ──────────── */}
          <div className="md:w-[55%] flex flex-col bg-white border-r overflow-y-auto">
            {/* Fake IG header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              {corretorFoto ? (
                <img
                  src={corretorFoto}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-pink-400"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500" />
              )}
              <span className="text-sm font-semibold text-gray-900">{corretorNome}</span>
              <MoreHorizontal className="ml-auto h-5 w-5 text-gray-500" />
            </div>

            {/* Image / Carrossel */}
            <div className="relative bg-gray-100 flex items-center justify-center">
              <div
                className={cn(
                  "w-full overflow-hidden",
                  isStory(activePost.formato) ? "aspect-[9/16] max-h-[70vh]" : "aspect-square"
                )}
              >
                <img
                  src={slides[slideIdx]}
                  alt="Creative preview"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Carrossel arrows */}
              {isCarrossel(activePost.formato) && totalSlides > 1 && (
                <>
                  {slideIdx > 0 && (
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                  )}
                  {slideIdx < totalSlides - 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  )}
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {slides.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          i === slideIdx ? "bg-blue-500" : "bg-white/70"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fake action bar */}
            <div className="flex items-center px-4 py-2 gap-4">
              <Heart className="h-6 w-6 text-gray-800 cursor-pointer hover:text-red-500 transition-colors" />
              <MessageCircle className="h-6 w-6 text-gray-800 cursor-pointer" />
              <Send className="h-6 w-6 text-gray-800 cursor-pointer" />
              <Bookmark className="ml-auto h-6 w-6 text-gray-800 cursor-pointer" />
            </div>

            {/* Caption */}
            <div className="px-4 pb-4 text-sm text-gray-800 leading-relaxed">
              <span className="font-semibold">{corretorNome}</span>{" "}
              <span>{legenda}</span>
              <div className="mt-1 text-blue-600">{hashtags.join(" ")}</div>
            </div>
          </div>

          {/* ─── Right Column — Actions + Editing (45%) ─────────── */}
          <div className="md:w-[45%] flex flex-col overflow-y-auto p-5 gap-5">
            <DialogHeader className="pb-0">
              <DialogTitle className="text-lg font-bold">Previsualizacao</DialogTitle>
              <DialogDescription className="sr-only">
                Pre-visualize e edite o post gerado
              </DialogDescription>
            </DialogHeader>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                <Download className="mr-1 h-4 w-4" /> Baixar Imagem
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyText} className="flex-1">
                <Copy className="mr-1 h-4 w-4" /> Copiar texto
              </Button>
            </div>

            {/* Personalizar Carrossel (only for carrossel) */}
            {isCarrossel(activePost.formato) && totalSlides > 1 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Personalizar Carrossel</h3>
                <div className="flex flex-col gap-2 rounded-lg border p-3">
                  {slides.map((src, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors",
                        i === slideIdx ? "bg-muted" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSlideIdx(i)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <img
                        src={src}
                        alt={`Slide ${i + 1}`}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <span className="text-sm font-medium">Slide {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legenda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Legenda</h3>
                <span
                  className={cn(
                    "text-xs",
                    legenda.length > CAPTION_MAX ? "text-red-500 font-semibold" : "text-muted-foreground"
                  )}
                >
                  {legenda.length}/{CAPTION_MAX}
                </span>
              </div>
              <Textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                rows={5}
                maxLength={CAPTION_MAX}
                className="resize-none text-sm"
              />
              <Button variant="ghost" size="sm" className="text-[#0f172a]">
                <Sparkles className="mr-1 h-4 w-4" /> Regenerar com IA
              </Button>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 text-xs cursor-pointer group"
                  >
                    {tag}
                    <button
                      onClick={() => removeHashtag(i)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                  placeholder="Adicionar hashtag..."
                  className="h-8 text-sm flex-1"
                />
                <Button variant="outline" size="sm" onClick={addHashtag} className="h-8 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-[#0f172a]">
                <Sparkles className="mr-1 h-4 w-4" /> Regenerar hashtags
              </Button>
            </div>

            {/* Acoes rapidas */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Acoes rapidas</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Adicionar ao Calendario Social
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${legenda}\n\n${hashtags.join(" ")}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between pt-2 border-t mt-auto">
              <Button
                variant="ghost"
                size="sm"
                disabled={activeIdx <= 0}
                onClick={() => activeIdx > 0 && navigateTo(posts[activeIdx - 1].id)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Post anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={activeIdx >= posts.length - 1}
                onClick={() =>
                  activeIdx < posts.length - 1 && navigateTo(posts[activeIdx + 1].id)
                }
              >
                Proximo post <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
