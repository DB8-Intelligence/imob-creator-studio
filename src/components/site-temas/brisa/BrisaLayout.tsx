import type { TemaProps } from "../tipos";
import BrisaHero from "./BrisaHero";
import BrisaImoveis from "./BrisaImoveis";
import BrisaAbout from "./BrisaAbout";
import BrisaDepoimentos from "./BrisaDepoimentos";
import BrisaContato from "./BrisaContato";
import BrisaFooter from "./BrisaFooter";

export default function BrisaLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Plus_Jakarta_Sans',sans-serif] text-gray-800">
      <BrisaHero {...props} />
      <BrisaImoveis {...props} />
      <BrisaAbout {...props} />
      <BrisaDepoimentos {...props} />
      <BrisaContato {...props} />
      <BrisaFooter {...props} />
    </div>
  );
}
