import type { TemaProps } from "../tipos";
import VitrineHero from "./VitrineHero";
import VitrineImoveis from "./VitrineImoveis";
import VitrineAbout from "./VitrineAbout";
import VitrineDepoimentos from "./VitrineDepoimentos";
import VitrineContato from "./VitrineContato";
import VitrineFooter from "./VitrineFooter";

export default function VitrineLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <VitrineHero {...props} />
      <VitrineImoveis {...props} />
      <VitrineAbout {...props} />
      <VitrineDepoimentos {...props} />
      <VitrineContato {...props} />
      <VitrineFooter {...props} />
    </div>
  );
}
