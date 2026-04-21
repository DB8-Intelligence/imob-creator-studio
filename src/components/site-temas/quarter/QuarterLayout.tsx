import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import QuarterHero from "./QuarterHero";
import QuarterImoveis from "./QuarterImoveis";
import QuarterAbout from "./QuarterAbout";
import QuarterDepoimentos from "./QuarterDepoimentos";
import QuarterContato from "./QuarterContato";
import QuarterFooter from "./QuarterFooter";

export default function QuarterLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Poppins',sans-serif] text-[#071c1f]">
      <SectionsWrapper site={props.site}>
        {{
          hero: <QuarterHero {...props} />,
          imoveis: <QuarterImoveis {...props} />,
          about: <QuarterAbout {...props} />,
          depoimentos: <QuarterDepoimentos {...props} />,
          contato: <QuarterContato {...props} />,
          footer: <QuarterFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
