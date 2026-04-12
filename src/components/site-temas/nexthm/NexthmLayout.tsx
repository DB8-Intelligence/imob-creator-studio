import type { TemaProps } from "../tipos";
import NexthmHero from "./NexthmHero";
import NexthmImoveis from "./NexthmImoveis";
import NexthmAbout from "./NexthmAbout";
import NexthmDepoimentos from "./NexthmDepoimentos";
import NexthmContato from "./NexthmContato";
import NexthmFooter from "./NexthmFooter";

export default function NexthmLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Poppins',sans-serif] text-[#214747]">
      <NexthmHero {...props} />
      <NexthmImoveis {...props} />
      <NexthmAbout {...props} />
      <NexthmDepoimentos {...props} />
      <NexthmContato {...props} />
      <NexthmFooter {...props} />
    </div>
  );
}
