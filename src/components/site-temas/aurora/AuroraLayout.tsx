import type { TemaProps } from "../tipos";
import AuroraHero from "./AuroraHero";
import AuroraImoveis from "./AuroraImoveis";
import AuroraAbout from "./AuroraAbout";
import AuroraDepoimentos from "./AuroraDepoimentos";
import AuroraContato from "./AuroraContato";
import AuroraFooter from "./AuroraFooter";

export default function AuroraLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <AuroraHero {...props} />
      <AuroraImoveis {...props} />
      <AuroraAbout {...props} />
      <AuroraDepoimentos {...props} />
      <AuroraContato {...props} />
      <AuroraFooter {...props} />
    </div>
  );
}
