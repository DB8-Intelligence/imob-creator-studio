import type { TemaProps } from "../tipos";
import CapitalHero from "./CapitalHero";
import CapitalImoveis from "./CapitalImoveis";
import CapitalAbout from "./CapitalAbout";
import CapitalDepoimentos from "./CapitalDepoimentos";
import CapitalContato from "./CapitalContato";
import CapitalFooter from "./CapitalFooter";

export default function CapitalLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <CapitalHero {...props} />
      <CapitalImoveis {...props} />
      <CapitalAbout {...props} />
      <CapitalDepoimentos {...props} />
      <CapitalContato {...props} />
      <CapitalFooter {...props} />
    </div>
  );
}
