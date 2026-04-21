import type { TemaProps } from "../tipos";
import HorizonteHero from "./HorizonteHero";
import HorizonteImoveis from "./HorizonteImoveis";
import HorizonteAbout from "./HorizonteAbout";
import HorizonteDepoimentos from "./HorizonteDepoimentos";
import HorizonteContato from "./HorizonteContato";
import HorizonteFooter from "./HorizonteFooter";

export default function HorizonteLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <HorizonteHero {...props} />
      <HorizonteImoveis {...props} />
      <HorizonteAbout {...props} />
      <HorizonteDepoimentos {...props} />
      <HorizonteContato {...props} />
      <HorizonteFooter {...props} />
    </div>
  );
}
