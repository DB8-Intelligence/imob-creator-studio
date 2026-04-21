import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import EixoHero from "./EixoHero";
import EixoImoveis from "./EixoImoveis";
import EixoAbout from "./EixoAbout";
import EixoDepoimentos from "./EixoDepoimentos";
import EixoContato from "./EixoContato";
import EixoFooter from "./EixoFooter";

export default function EixoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <EixoHero {...props} />,
          imoveis: <EixoImoveis {...props} />,
          about: <EixoAbout {...props} />,
          depoimentos: <EixoDepoimentos {...props} />,
          contato: <EixoContato {...props} />,
          footer: <EixoFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
