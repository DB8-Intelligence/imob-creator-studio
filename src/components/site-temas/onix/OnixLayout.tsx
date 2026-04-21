import type { TemaProps } from "../tipos";
import OnixHero from "./OnixHero";
import OnixImoveis from "./OnixImoveis";
import OnixAbout from "./OnixAbout";
import OnixDepoimentos from "./OnixDepoimentos";
import OnixContato from "./OnixContato";
import OnixFooter from "./OnixFooter";

export default function OnixLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-900">
      <OnixHero {...props} />
      <OnixImoveis {...props} />
      <OnixAbout {...props} />
      <OnixDepoimentos {...props} />
      <OnixContato {...props} />
      <OnixFooter {...props} />
    </div>
  );
}
