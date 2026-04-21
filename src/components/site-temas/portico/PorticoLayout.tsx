import type { TemaProps } from "../tipos";
import PorticoHero from "./PorticoHero";
import PorticoImoveis from "./PorticoImoveis";
import PorticoAbout from "./PorticoAbout";
import PorticoDepoimentos from "./PorticoDepoimentos";
import PorticoContato from "./PorticoContato";
import PorticoFooter from "./PorticoFooter";

export default function PorticoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <PorticoHero {...props} />
      <PorticoImoveis {...props} />
      <PorticoAbout {...props} />
      <PorticoDepoimentos {...props} />
      <PorticoContato {...props} />
      <PorticoFooter {...props} />
    </div>
  );
}
