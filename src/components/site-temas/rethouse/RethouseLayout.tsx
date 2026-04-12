import type { TemaProps } from "../tipos";
import RethouseHero from "./RethouseHero";
import RethouseImoveis from "./RethouseImoveis";
import RethouseAbout from "./RethouseAbout";
import RethouseDepoimentos from "./RethouseDepoimentos";
import RethouseContato from "./RethouseContato";
import RethouseFooter from "./RethouseFooter";

export default function RethouseLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-[#333]">
      <RethouseHero {...props} />
      <RethouseImoveis {...props} />
      <RethouseAbout {...props} />
      <RethouseDepoimentos {...props} />
      <RethouseContato {...props} />
      <RethouseFooter {...props} />
    </div>
  );
}
