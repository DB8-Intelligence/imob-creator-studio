/**
 * usePageMeta — Dynamic page title + meta description (DEV-34 Growth)
 *
 * Sets document.title and meta description per route.
 * Works with Vite SPA (no react-helmet needed).
 */
import { useEffect } from "react";

const BASE_TITLE = "ImobCreator AI";
const BASE_DESC = "Gere posts, reels e criativos imobiliários com IA. Automatize do WhatsApp ao Instagram.";

interface PageMeta {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export function usePageMeta({ title, description, noIndex }: PageMeta = {}) {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Plataforma de Inteligência Imobiliária`;

    // Description
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute("content", description ?? BASE_DESC);
    }

    // OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title ? `${title} | ${BASE_TITLE}` : document.title);
    }

    // OG description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description ?? BASE_DESC);
    }

    // Robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", noIndex ? "noindex,nofollow" : "index,follow");
    }

    return () => {
      // Reset on unmount
      document.title = `${BASE_TITLE} | Plataforma de Inteligência Imobiliária`;
    };
  }, [title, description, noIndex]);
}

/** Predefined page meta for common routes */
export const PAGE_META: Record<string, PageMeta> = {
  "/": { title: "Plataforma de Inteligência Imobiliária", description: "Gere posts, reels e criativos imobiliários com IA. Templates profissionais, automação e publicação para corretores e imobiliárias." },
  "/para-corretores": { title: "Para Corretores de Imóveis", description: "Crie conteúdo profissional para Instagram em 2 minutos. Posts, Stories, Reels e vídeos com IA. Sem designer, sem complicação." },
  "/para-imobiliarias": { title: "Para Imobiliárias", description: "Escale a produção de conteúdo da sua imobiliária com IA. Gestão de equipe, templates padronizados e automação de publicação." },
  "/para-equipes": { title: "Para Equipes Imobiliárias", description: "Padronize a comunicação visual da sua equipe. Brand kit, templates compartilhados e fluxo de aprovação com IA." },
  "/auth": { title: "Entrar ou Criar Conta", description: "Acesse sua conta ImobCreator ou crie uma nova. Comece a gerar criativos com IA gratuitamente." },
  "/studio": { title: "Studio de Criação", description: "Escolha um template e gere criativos profissionais com inteligência artificial.", noIndex: true },
  "/dashboard": { title: "Dashboard", noIndex: true },
  "/lp/criar-posts-imoveis": { title: "Criar Posts de Imóveis com IA", description: "Gere posts profissionais para Instagram e Facebook em segundos. Templates imobiliários otimizados para engajamento e conversão." },
  "/lp/video-imobiliario": { title: "Vídeos Imobiliários com IA", description: "Crie vídeos profissionais de imóveis automaticamente. Ken Burns, transições cinematográficas e música. Sem edição manual." },
  "/lp/automacao-imobiliaria": { title: "Automação Imobiliária com IA", description: "Automatize a geração e publicação de conteúdo imobiliário. Do cadastro do imóvel ao post no Instagram, tudo automático." },
  "/video": { title: "Vídeos Imobiliários", description: "Transforme fotos de imóveis em vídeos profissionais com IA. Ken Burns, transições e música em minutos." },
};
