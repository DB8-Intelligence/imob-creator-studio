import TemaBreza, { type SiteThemeConfig } from "./TemaBreza";
import TemaUrbano from "./TemaUrbano";
import TemaLitoral from "./TemaLitoral";
import TemaHamilton from "./TemaHamilton";

interface ThemeRendererProps {
  config: SiteThemeConfig;
  theme?: string;
  isPreview?: boolean;
}

const THEMES: Record<string, React.FC<{ config: SiteThemeConfig }>> = {
  brisa: TemaBreza,
  urbano: TemaUrbano,
  litoral: TemaLitoral,
  hamilton: TemaHamilton,
};

export default function ThemeRenderer({ config, theme = "brisa", isPreview = false }: ThemeRendererProps) {
  const containerStyle = isPreview ? { transform: "scale(0.5)", transformOrigin: "top left" as const, width: "200%", height: "200%" } : {};

  const ThemeComponent = THEMES[theme] || TemaBreza;

  return (
    <div style={containerStyle} className={isPreview ? "overflow-hidden" : ""}>
      <ThemeComponent config={config} />
    </div>
  );
}
