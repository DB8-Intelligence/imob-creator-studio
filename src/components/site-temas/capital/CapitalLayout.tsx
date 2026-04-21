import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import CapitalHero from "./CapitalHero";
import CapitalImoveis from "./CapitalImoveis";
import CapitalAbout from "./CapitalAbout";
import CapitalDepoimentos from "./CapitalDepoimentos";
import CapitalContato from "./CapitalContato";
import CapitalFooter from "./CapitalFooter";

export default function CapitalLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <CapitalHero {...props} />,
          imoveis: <CapitalImoveis {...props} />,
          about: <CapitalAbout {...props} />,
          depoimentos: <CapitalDepoimentos {...props} />,
          contato: <CapitalContato {...props} />,
          footer: <CapitalFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
