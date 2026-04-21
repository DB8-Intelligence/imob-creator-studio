import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import VitrineHero from "./VitrineHero";
import VitrineImoveis from "./VitrineImoveis";
import VitrineAbout from "./VitrineAbout";
import VitrineDepoimentos from "./VitrineDepoimentos";
import VitrineContato from "./VitrineContato";
import VitrineFooter from "./VitrineFooter";

export default function VitrineLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <VitrineHero {...props} />,
          imoveis: <VitrineImoveis {...props} />,
          about: <VitrineAbout {...props} />,
          depoimentos: <VitrineDepoimentos {...props} />,
          contato: <VitrineContato {...props} />,
          footer: <VitrineFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
