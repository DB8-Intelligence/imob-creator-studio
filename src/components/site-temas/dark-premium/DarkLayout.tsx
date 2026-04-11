import type { TemaProps } from "../tipos";
import DarkHero from "./DarkHero";
import DarkImoveis from "./DarkImoveis";
import DarkAbout from "./DarkAbout";
import DarkDepoimentos from "./DarkDepoimentos";
import DarkContato from "./DarkContato";
import DarkFooter from "./DarkFooter";

export default function DarkLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full font-['Inter',sans-serif] text-white" style={{ backgroundColor: "#0F172A" }}>
      <DarkHero {...props} />
      <DarkImoveis {...props} />
      <DarkAbout {...props} />
      <DarkDepoimentos {...props} />
      <DarkContato {...props} />
      <DarkFooter {...props} />
    </div>
  );
}
