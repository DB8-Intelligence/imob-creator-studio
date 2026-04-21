import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import DarkHero from "./DarkHero";
import DarkImoveis from "./DarkImoveis";
import DarkAbout from "./DarkAbout";
import DarkDepoimentos from "./DarkDepoimentos";
import DarkContato from "./DarkContato";
import DarkFooter from "./DarkFooter";

export default function DarkLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full font-['Inter',sans-serif] text-white" style={{ backgroundColor: "#0F172A" }}>
      <SectionsWrapper site={props.site}>
        {{
          hero: <DarkHero {...props} />,
          imoveis: <DarkImoveis {...props} />,
          about: <DarkAbout {...props} />,
          depoimentos: <DarkDepoimentos {...props} />,
          contato: <DarkContato {...props} />,
          footer: <DarkFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
