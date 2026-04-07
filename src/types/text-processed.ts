/**
 * text-processed.ts — Copy processado a partir do texto bruto do usuário (Creative Engine)
 *
 * O texto_bruto do usuário é transformado em múltiplas peças de copy
 * pelo CopyProcessor (Fase 4), que usa Claude para gerar variações
 * adaptadas ao tom de comunicação e nicho do perfil de marca.
 *
 * Quando o pipeline usa o prompt unificado (analyzeCreative),
 * o copy já vem dentro de ImageAnalysis.copy. Este tipo é usado
 * para processamento standalone ou ajustes manuais.
 */
import type { CopyMood } from "./image-analysis";

export interface TextProcessed {
  /** Texto original enviado pelo usuário */
  texto_bruto: string;

  /** Título principal (máx 2 linhas curtas) */
  titulo_linha1: string;
  titulo_linha2: string;

  /** Título completo em uma linha (para stories) */
  titulo_completo: string;

  /** Frase de apoio contextual (máx 65 chars) */
  subtitulo: string;

  /** Tagline aspiracional curta (3-5 palavras) */
  conceito_campanha: string;

  /** Call-to-action direto (máx 4 palavras) */
  cta_texto: string;

  /** Badge de urgência/categoria (máx 3 palavras, uppercase) */
  badge_texto: string;

  /** Versão cursiva/elegante do título */
  script_elegante: string;

  /** Tom emocional do copy */
  mood: CopyMood;

  /** Legenda completa para Instagram (com emojis e hashtags) */
  copy_instagram: string;

  /** Modelo Claude usado para gerar o copy */
  model_used: "claude-sonnet-4-6" | "claude-haiku-4-5";
}
