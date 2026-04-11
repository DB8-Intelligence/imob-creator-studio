import type { TemaProps } from "../tipos";
import LitoralHero from "./LitoralHero";
import LitoralImoveis from "./LitoralImoveis";
import LitoralAbout from "./LitoralAbout";
import LitoralDepoimentos from "./LitoralDepoimentos";
import LitoralContato from "./LitoralContato";
import LitoralFooter from "./LitoralFooter";

export default function LitoralLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Nunito',sans-serif] text-gray-800">
      <LitoralHero {...props} />
      <LitoralImoveis {...props} />
      <LitoralAbout {...props} />
      <LitoralDepoimentos {...props} />
      <LitoralContato {...props} />
      <LitoralFooter {...props} />
    </div>
  );
}
