import type { TemaProps } from "./tipos";
import BrisaLayout from "./brisa/BrisaLayout";
import UrbanoLayout from "./urbano/UrbanoLayout";
import LitoralLayout from "./litoral/LitoralLayout";
import DarkLayout from "./dark-premium/DarkLayout";

const THEMES: Record<string, React.FC<TemaProps>> = {
  brisa: BrisaLayout,
  urbano: UrbanoLayout,
  litoral: LitoralLayout,
  "dark-premium": DarkLayout,
};

export default function TemaRendererV2(props: TemaProps) {
  const themeKey = props.site.tema || "brisa";
  const ThemeComponent = THEMES[themeKey] || BrisaLayout;

  const containerStyle = props.isPreview
    ? {
        transform: "scale(0.5)",
        transformOrigin: "top left" as const,
        width: "200%",
        height: "200%",
      }
    : {};

  return (
    <div
      style={containerStyle}
      className={props.isPreview ? "overflow-hidden" : ""}
    >
      <ThemeComponent {...props} />
    </div>
  );
}
