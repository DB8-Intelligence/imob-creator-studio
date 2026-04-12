import type { TemaProps } from "../tipos";
import QuarterHero from "./QuarterHero";
import QuarterImoveis from "./QuarterImoveis";
import QuarterAbout from "./QuarterAbout";
import QuarterDepoimentos from "./QuarterDepoimentos";
import QuarterContato from "./QuarterContato";
import QuarterFooter from "./QuarterFooter";

export default function QuarterLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Poppins',sans-serif] text-[#071c1f]">
      <QuarterHero {...props} />
      <QuarterImoveis {...props} />
      <QuarterAbout {...props} />
      <QuarterDepoimentos {...props} />
      <QuarterContato {...props} />
      <QuarterFooter {...props} />
    </div>
  );
}
