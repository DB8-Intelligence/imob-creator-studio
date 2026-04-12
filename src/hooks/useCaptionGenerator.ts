/**
 * useCaptionGenerator.ts — Hook para geração de legendas + hashtags + CTA
 *
 * Gera pacote completo em uma chamada: legenda, hashtags, CTA, versão stories.
 * Mock enquanto API Railway não está conectada.
 */
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface CaptionRequest {
  propertyName: string;
  postType: "feed" | "stories" | "reels" | "carrossel";
  objetivo: "venda" | "aluguel" | "engajamento" | "autoridade";
  tom: "luxo" | "profissional" | "informal" | "urgencia" | "emocional";
  promptExtra?: string;
  incluirEmojis: boolean;
  incluirHashtags: boolean;
  incluirCta: boolean;
}

export interface CaptionResult {
  legenda: string;
  hashtags: string[];
  cta: string;
  storiesVersion: string;
  generatedAt: string;
}

export interface SavedPost {
  id: string;
  propertyName: string;
  postType: string;
  legenda: string;
  hashtags: string[];
  cta: string;
  status: "rascunho" | "aprovado" | "agendado" | "publicado";
  createdAt: string;
}

// Mock generation
function generateMock(req: CaptionRequest): CaptionResult {
  const emojis = req.incluirEmojis;
  const templates: Record<string, string> = {
    luxo: `${emojis ? "✨ " : ""}Exclusividade que você merece. ${req.propertyName} redefine o conceito de morar bem.\n\nCada detalhe foi pensado para quem não abre mão de sofisticação e conforto.${emojis ? " 🏛️" : ""}\n\nAgende sua visita privativa e descubra um novo padrão de vida.`,
    profissional: `${emojis ? "🏠 " : ""}${req.propertyName} — oportunidade real no mercado.\n\nLocalização estratégica, acabamento de qualidade e condições flexíveis de negociação.\n\nEntre em contato para mais informações e agende sua visita.`,
    informal: `${emojis ? "👋 " : ""}E aí, já conhece o ${req.propertyName}?\n\nTá procurando um lugar incrível pra chamar de seu? Esse aqui tem tudo que você precisa e mais um pouco!${emojis ? " 😍" : ""}\n\nVem conferir!`,
    urgencia: `${emojis ? "🔥 " : ""}ÚLTIMA UNIDADE — ${req.propertyName}\n\nEssa é a chance que você esperava. Valores a partir de condições especiais por tempo limitado.${emojis ? " ⏰" : ""}\n\nNão perca. Fale comigo agora.`,
    emocional: `${emojis ? "🏡 " : ""}Imagine chegar em casa e sentir que cada canto foi feito pra você.\n\n${req.propertyName} não é só um endereço — é onde seus melhores momentos vão acontecer.${emojis ? " 💛" : ""}\n\nVenha sentir essa energia pessoalmente.`,
  };

  const hashtags = req.incluirHashtags
    ? ["imobiliaria", "imoveis", "corretor", "apartamento", "casa", req.objetivo, req.tom, "investimento", "morar", "sp"].map((h) => `#${h}`)
    : [];

  const ctas: Record<string, string> = {
    venda: "Quer saber mais? Chama no direct ou WhatsApp que te conto tudo! 📲",
    aluguel: "Disponível para locação imediata. Agende sua visita! 🗓️",
    engajamento: "Qual ambiente você mais gostou? Comenta aqui! 💬",
    autoridade: "Quer dicas exclusivas do mercado? Siga e ative o sininho! 🔔",
  };

  const storiesVersion = `${emojis ? "📍 " : ""}${req.propertyName}\n${req.objetivo === "venda" ? "À venda" : req.objetivo === "aluguel" ? "Para alugar" : "Confira"}\n\n${emojis ? "👆 " : ""}Arrasta pra cima!`;

  return {
    legenda: templates[req.tom] ?? templates.profissional,
    hashtags,
    cta: req.incluirCta ? (ctas[req.objetivo] ?? ctas.venda) : "",
    storiesVersion,
    generatedAt: new Date().toISOString(),
  };
}

// Mock saved posts
const MOCK_POSTS: SavedPost[] = [
  { id: "p1", propertyName: "Apt Vila Mariana 3Q", postType: "feed", legenda: "Exclusividade que você merece...", hashtags: ["#imoveis", "#sp"], cta: "Chama no direct!", status: "aprovado", createdAt: "2026-04-03T10:00:00Z" },
  { id: "p2", propertyName: "Casa Alphaville 420m²", postType: "reels", legenda: "Tour completo nessa mansão...", hashtags: ["#luxo", "#alphaville"], cta: "Agende sua visita!", status: "publicado", createdAt: "2026-04-01T15:00:00Z" },
  { id: "p3", propertyName: "Cobertura Itaim 200m²", postType: "stories", legenda: "Vista de tirar o fôlego...", hashtags: ["#cobertura", "#itaim"], cta: "Arrasta pra cima!", status: "rascunho", createdAt: "2026-04-04T09:00:00Z" },
  { id: "p4", propertyName: "Studio Moema", postType: "carrossel", legenda: "Compacto e completo...", hashtags: ["#studio", "#moema"], cta: "Saiba mais!", status: "agendado", createdAt: "2026-04-02T14:00:00Z" },
];

export function useCaptionGenerator() {
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async (request: CaptionRequest) => {
    setIsGenerating(true);
    setResult(null);
    try {
      const fallback = generateMock(request);

      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          type: request.postType,
          propertyData: {
            title: request.propertyName,
            cta: request.incluirCta ? request.objetivo : null,
          },
          aiPrompt: request.promptExtra ?? null,
        },
      });

      let res: CaptionResult;

      if (error || !data) {
        res = fallback;
      } else {
        const payload = data as Record<string, unknown>;
        const legendaRaw = payload.legenda ?? payload.caption ?? payload.copy_instagram;
        const hashtagsRaw = payload.hashtags;
        const ctaRaw = payload.cta;
        const storiesRaw = payload.storiesVersion ?? payload.stories_version;

        const parsedHashtags = Array.isArray(hashtagsRaw)
          ? hashtagsRaw.map((h) => String(h))
          : typeof hashtagsRaw === "string"
            ? hashtagsRaw.split(/\s+/).filter((h) => h.startsWith("#"))
            : [];

        res = {
          legenda: typeof legendaRaw === "string" && legendaRaw.trim().length > 0 ? legendaRaw : fallback.legenda,
          hashtags: request.incluirHashtags ? parsedHashtags : [],
          cta: request.incluirCta
            ? (typeof ctaRaw === "string" && ctaRaw.trim().length > 0 ? ctaRaw : fallback.cta)
            : "",
          storiesVersion:
            typeof storiesRaw === "string" && storiesRaw.trim().length > 0
              ? storiesRaw
              : fallback.storiesVersion,
          generatedAt: new Date().toISOString(),
        };
      }

      setResult(res);
      toast({ title: "Pacote gerado!" });
    } catch {
      toast({ title: "Erro na geração", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateField = async (field: "legenda" | "hashtags" | "cta" | "storiesVersion", request: CaptionRequest) => {
    // Regenerate just one field
    await new Promise((r) => setTimeout(r, 800));
    const res = generateMock(request);
    if (result) {
      setResult({ ...result, [field]: res[field] });
    }
  };

  return { result, isGenerating, generate, regenerateField, savedPosts: MOCK_POSTS };
}
