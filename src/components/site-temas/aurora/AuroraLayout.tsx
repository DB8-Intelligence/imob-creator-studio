import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import AuroraHero from "./AuroraHero";
import AuroraImoveis from "./AuroraImoveis";
import AuroraAbout from "./AuroraAbout";
import AuroraDepoimentos from "./AuroraDepoimentos";
import AuroraContato from "./AuroraContato";
import AuroraFooter from "./AuroraFooter";

export default function AuroraLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <AuroraHero {...props} />,
          imoveis: <AuroraImoveis {...props} />,
          about: <AuroraAbout {...props} />,
          depoimentos: <AuroraDepoimentos {...props} />,
          contato: <AuroraContato {...props} />,
          footer: <AuroraFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
