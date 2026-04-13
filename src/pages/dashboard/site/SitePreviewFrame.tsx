import type { FC } from "react";
import ThemeRenderer from "@/components/site-temas/ThemeRenderer";
import type { CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";

interface SitePreviewFrameProps {
  site: CorretorSite;
  imoveis?: SiteImovel[];
  depoimentos?: SiteDepoimento[];
  slug?: string;
  viewMode?: "desktop" | "mobile";
}

const SitePreviewFrame: FC<SitePreviewFrameProps> = ({
  site,
  imoveis = [],
  depoimentos = [],
  slug = "meu-site",
  viewMode = "desktop",
}) => {
  const innerWidth = viewMode === "desktop" ? 1280 : 390;
  const containerWidth = viewMode === "desktop" ? 640 : 195;
  const scale = containerWidth / innerWidth;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400 border border-gray-200">
          {slug}.nexoimobai.com.br
        </div>
      </div>

      {/* Scaled preview */}
      <div
        className="relative overflow-hidden bg-gray-50"
        style={{ width: containerWidth, height: containerWidth * 1.2 }}
      >
        <div
          style={{
            width: innerWidth,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          <ThemeRenderer site={site} imoveis={imoveis} depoimentos={depoimentos} />
        </div>
      </div>
    </div>
  );
};

export default SitePreviewFrame;
