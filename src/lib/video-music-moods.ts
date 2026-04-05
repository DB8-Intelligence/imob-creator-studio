/**
 * video-music-moods.ts
 *
 * Catalogo de moods musicais do modulo de video do ImobCreator.
 *
 * Cada mood define a intencao emocional da trilha sonora.
 * O backend seleciona a trilha real com base no mood recebido.
 *
 * FILOSOFIA: A musica e uma camada de ambientacao emocional.
 * Ela nao altera a imagem — apenas complementa a experiencia.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type MusicMoodId =
  | "luxo"
  | "moderno"
  | "praia"
  | "corporativo"
  | "familiar"
  | "sem_musica";

export interface MusicMood {
  id: MusicMoodId;
  name: string;
  description: string;
  /** Intencao emocional */
  emotion: string;
  /** Uso recomendado */
  best_for: string;
  /** BPM aproximado (0 = sem musica) */
  bpm_range: string;
  /** Templates que combinam melhor */
  best_with_templates: string[];
  /** Presets visuais que combinam */
  best_with_presets: string[];
  /** Icone para exibicao */
  icon: string;
  /** Valor enviado no payload para o backend */
  payload_value: string;
}

// ─── Catalogo ───────────────────────────────────────────────────────────────

export const MUSIC_MOODS: Record<MusicMoodId, MusicMood> = {

  luxo: {
    id: "luxo",
    name: "Luxo",
    description: "Piano suave e cordas delicadas. Transmite exclusividade e sofisticacao.",
    emotion: "Elegancia e aspiracao",
    best_for: "Imoveis de alto padrao, coberturas, penthouses",
    bpm_range: "60-80 BPM",
    best_with_templates: ["tour_ambientes", "slideshow_classico"],
    best_with_presets: ["luxury"],
    icon: "🎹",
    payload_value: "luxury",
  },

  moderno: {
    id: "moderno",
    name: "Moderno",
    description: "Lofi chill e beats contemporaneos. Transmite modernidade e lifestyle urbano.",
    emotion: "Contemporaneo e cool",
    best_for: "Apartamentos urbanos, studios, lancamentos modernos",
    bpm_range: "80-100 BPM",
    best_with_templates: ["slideshow_classico", "highlight_reel"],
    best_with_presets: ["default", "fast_sales"],
    icon: "🎧",
    payload_value: "modern",
  },

  praia: {
    id: "praia",
    name: "Praia / Litoral",
    description: "Violao acustico e ambiente tropical. Transmite leveza e estilo de vida praiano.",
    emotion: "Relaxamento e desejo",
    best_for: "Imoveis no litoral, casas de praia, condominios resort",
    bpm_range: "70-90 BPM",
    best_with_templates: ["slideshow_classico", "tour_ambientes"],
    best_with_presets: ["default", "luxury"],
    icon: "🌊",
    payload_value: "warm",
  },

  corporativo: {
    id: "corporativo",
    name: "Corporativo",
    description: "Beat limpo e inspiracional. Transmite confianca e profissionalismo.",
    emotion: "Confianca e credibilidade",
    best_for: "Salas comerciais, galpoes, imoveis corporativos, imobiliarias",
    bpm_range: "90-110 BPM",
    best_with_templates: ["highlight_reel", "slideshow_classico"],
    best_with_presets: ["default", "fast_sales"],
    icon: "💼",
    payload_value: "energetic",
  },

  familiar: {
    id: "familiar",
    name: "Familiar",
    description: "Melodia acolhedora e suave. Transmite lar, conforto e seguranca.",
    emotion: "Acolhimento e pertencimento",
    best_for: "Casas familiares, condominios com playground, bairros residenciais",
    bpm_range: "60-80 BPM",
    best_with_templates: ["tour_ambientes", "slideshow_classico"],
    best_with_presets: ["default", "luxury"],
    icon: "🏡",
    payload_value: "calm",
  },

  sem_musica: {
    id: "sem_musica",
    name: "Sem Musica",
    description: "Video sem trilha sonora. Permite que o corretor narre sobre o video ou adicione audio depois.",
    emotion: "Neutro",
    best_for: "Videos para narracao posterior, uso em apresentacoes",
    bpm_range: "—",
    best_with_templates: ["tour_ambientes", "slideshow_classico", "highlight_reel"],
    best_with_presets: ["default", "luxury", "fast_sales"],
    icon: "🔇",
    payload_value: "none",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const MUSIC_MOOD_LIST = Object.values(MUSIC_MOODS);

export function getMusicMood(id: string): MusicMood {
  return MUSIC_MOODS[id as MusicMoodId] ?? MUSIC_MOODS.moderno;
}

export function getDefaultMusicMood(): MusicMoodId {
  return "moderno";
}

/**
 * Retorna o valor que vai no payload para o backend FFmpeg.
 * Mapeia mood IDs internos para os valores do AudioConfig.mood.
 */
export function moodToPayloadValue(moodId: string): string {
  const mood = MUSIC_MOODS[moodId as MusicMoodId];
  return mood?.payload_value ?? "modern";
}
