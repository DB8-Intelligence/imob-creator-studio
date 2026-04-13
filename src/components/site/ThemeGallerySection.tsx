/**
 * ThemeGallerySection.tsx — Galeria de temas de site imobiliario.
 * Exibe cards visuais com gradiente, nome e descricao de cada tema.
 * Ao clicar, abre ThemePreviewModal com o tema renderizado.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import { TEMAS, type TemaCorr } from "@/types/site";
import ThemePreviewModal from "./ThemePreviewModal";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const THEME_GRADIENTS: Record<TemaCorr, string> = {
  brisa: "from-sky-400 to-cyan-300",
  urbano: "from-gray-800 to-orange-500",
  litoral: "from-[#002B5B] to-[#D4AF37]",
  "dark-premium": "from-[#1E3A8A] to-[#D4AF37]",
  nestland: "from-[#0f0f0f] to-[#b99755]",
  nexthm: "from-[#122122] to-[#2c686b]",
  ortiz: "from-[#05344a] to-[#25a5de]",
  quarter: "from-[#071c1f] to-[#FF5A3C]",
  rethouse: "from-[#1a2b6b] to-[#3454d1]",
};

const THEME_TAGS: Partial<Record<TemaCorr, string>> = {
  nestland: "Novo",
  nexthm: "Novo",
  ortiz: "Novo",
  quarter: "Novo",
  rethouse: "Novo",
  "dark-premium": "Premium",
};

interface ThemeGallerySectionProps {
  onSelectTheme?: (themeId: TemaCorr) => void;
}

export default function ThemeGallerySection({ onSelectTheme }: ThemeGallerySectionProps) {
  const [previewTheme, setPreviewTheme] = useState<typeof TEMAS[0] | null>(null);

  return (
    <>
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              10 Modelos Profissionais
            </span>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Escolha o modelo do seu <span className="text-[#002B5B]">site imobiliario</span>
            </h2>
            <p className="mt-3 text-[#6B7280] text-base max-w-lg mx-auto">
              Templates profissionais prontos para usar. Clique para visualizar como ficara seu site.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {TEMAS.map((tema) => {
              const tag = THEME_TAGS[tema.id];
              return (
                <motion.button
                  key={tema.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  type="button"
                  onClick={() => setPreviewTheme(tema)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#E5E7EB] bg-white text-left transition-all hover:border-[#002B5B] hover:shadow-[0_8px_30px_rgba(0,43,91,0.12)]"
                >
                  {/* Gradient Preview */}
                  <div className={`relative h-28 w-full bg-gradient-to-br ${THEME_GRADIENTS[tema.id]}`}>
                    {tag && (
                      <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                        tag === "Novo" ? "bg-[#059669]" : "bg-[#D4AF37]"
                      }`}>
                        {tag}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 bg-black/30 backdrop-blur-[2px]">
                      <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#0A1628] shadow-lg">
                        <Eye className="h-3.5 w-3.5" />
                        Visualizar
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-bold text-[#0A1628]">{tema.label}</p>
                    <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">{tema.preview}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal
          open={!!previewTheme}
          onClose={() => setPreviewTheme(null)}
          themeId={previewTheme.id}
          themeName={previewTheme.label}
          onSelectTheme={onSelectTheme}
        />
      )}
    </>
  );
}
