import TemaBreza, { type SiteThemeConfig } from "./TemaBreza";
import TemaUrbano from "./TemaUrbano";
import TemaLitoral from "./TemaLitoral";

interface ThemeRendererProps {
  config: SiteThemeConfig;
  theme?: string;
  isPreview?: boolean;
}

export default function ThemeRenderer({ config, theme = "brisa", isPreview = false }: ThemeRendererProps) {
  const containerStyle = isPreview ? { transform: "scale(0.5)", transformOrigin: "top left" as const, width: "200%", height: "200%" } : {};

  const ThemeComponent = theme === "urbano" ? TemaUrbano : theme === "litoral" ? TemaLitoral : TemaBreza;

  return (
    <div style={containerStyle} className={isPreview ? "overflow-hidden" : ""}>
      <ThemeComponent config={config} />
    </div>
  );
}
