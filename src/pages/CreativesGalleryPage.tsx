import { useState } from "react";
import { AlertTriangle, Images, Film, Layers } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useCreativesGallery } from "@/hooks/useCreativesGallery";
import { CreativeCard } from "@/components/creatives/CreativeCard";
import { CreativeModal } from "@/components/creatives/CreativeModal";
import { ModuleBadges } from "@/components/ModuleBadges";
import type { Creative } from "@/hooks/useCreativesGallery";

const TABS = [
  { key: "images", label: "Imagens", Icon: Images },
  { key: "sequences", label: "Sequências", Icon: Layers },
  { key: "videos", label: "Vídeos", Icon: Film },
] as const;

export default function CreativesGalleryPage() {
  const {
    creatives,
    loading,
    tab,
    setTab,
    counts,
    getFormats,
    getTimeLeft,
    refetch,
  } = useCreativesGallery();
  const [selected, setSelected] = useState<Creative | null>(null);

  const filtered = creatives.filter((c) =>
    tab === "images"
      ? c.format_feed || c.format_story || c.format_square
      : tab === "videos"
        ? !!c.format_reel
        : false
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Histórico de Criações
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Todas as suas imagens, sequências e vídeos gerados
            </p>
          </div>
          <ModuleBadges />
        </div>

        {/* Expiration warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span className="text-amber-800">
            <strong>Atenção:</strong> Os criativos são automaticamente apagados
            após <strong>24 horas</strong>. Faça o download antes que expirem!
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {counts[key] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Images className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum criativo ainda</p>
            <p className="text-sm mt-1">
              Crie seu primeiro criativo para ver aqui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((creative) => (
              <CreativeCard
                key={creative.id}
                creative={creative}
                formatCount={getFormats(creative).length}
                timeLeft={getTimeLeft(creative.expires_at)}
                onClick={() => setSelected(creative)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <CreativeModal
          creative={selected}
          formats={selected ? getFormats(selected) : []}
          onClose={() => setSelected(null)}
          onRefresh={refetch}
        />
      </div>
    </AppLayout>
  );
}
