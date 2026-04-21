import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import RethouseHero from "./RethouseHero";
import RethouseImoveis from "./RethouseImoveis";
import RethouseAbout from "./RethouseAbout";
import RethouseDepoimentos from "./RethouseDepoimentos";
import RethouseContato from "./RethouseContato";
import RethouseFooter from "./RethouseFooter";

export default function RethouseLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-[#333]">
      <SectionsWrapper site={props.site}>
        {{
          hero: <RethouseHero {...props} />,
          imoveis: <RethouseImoveis {...props} />,
          about: <RethouseAbout {...props} />,
          depoimentos: <RethouseDepoimentos {...props} />,
          contato: <RethouseContato {...props} />,
          footer: <RethouseFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
