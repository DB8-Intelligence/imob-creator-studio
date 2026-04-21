import type { TemaProps } from "../tipos";
import EixoHero from "./EixoHero";
import EixoImoveis from "./EixoImoveis";
import EixoAbout from "./EixoAbout";
import EixoDepoimentos from "./EixoDepoimentos";
import EixoContato from "./EixoContato";
import EixoFooter from "./EixoFooter";

export default function EixoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <EixoHero {...props} />
      <EixoImoveis {...props} />
      <EixoAbout {...props} />
      <EixoDepoimentos {...props} />
      <EixoContato {...props} />
      <EixoFooter {...props} />
    </div>
  );
}
