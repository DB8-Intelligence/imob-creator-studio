import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import NexthmHero from "./NexthmHero";
import NexthmImoveis from "./NexthmImoveis";
import NexthmAbout from "./NexthmAbout";
import NexthmDepoimentos from "./NexthmDepoimentos";
import NexthmContato from "./NexthmContato";
import NexthmFooter from "./NexthmFooter";

export default function NexthmLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Poppins',sans-serif] text-[#214747]">
      <SectionsWrapper site={props.site}>
        {{
          hero: <NexthmHero {...props} />,
          imoveis: <NexthmImoveis {...props} />,
          about: <NexthmAbout {...props} />,
          depoimentos: <NexthmDepoimentos {...props} />,
          contato: <NexthmContato {...props} />,
          footer: <NexthmFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
