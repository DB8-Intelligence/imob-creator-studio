/**
 * LPRenderer — dispatcher que renderiza o template correto da LP.
 */
import type { LPTemplateProps } from "@/types/landing-page";
import AmbarTemplate from "./templates/AmbarTemplate";
import LinhoTemplate from "./templates/LinhoTemplate";
import SalviaTemplate from "./templates/SalviaTemplate";
import NoirTemplate from "./templates/NoirTemplate";
import LarTemplate from "./templates/LarTemplate";
import SoleneTemplate from "./templates/SoleneTemplate";

const TEMPLATES: Record<string, React.FC<LPTemplateProps>> = {
  ambar: AmbarTemplate,
  linho: LinhoTemplate,
  salvia: SalviaTemplate,
  noir: NoirTemplate,
  lar: LarTemplate,
  solene: SoleneTemplate,
};

export default function LPRenderer(props: LPTemplateProps) {
  const Template = TEMPLATES[props.lp.template] || AmbarTemplate;
  return <Template {...props} />;
}
