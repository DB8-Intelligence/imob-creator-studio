import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import PorticoHero from "./PorticoHero";
import PorticoImoveis from "./PorticoImoveis";
import PorticoAbout from "./PorticoAbout";
import PorticoDepoimentos from "./PorticoDepoimentos";
import PorticoContato from "./PorticoContato";
import PorticoFooter from "./PorticoFooter";

export default function PorticoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <PorticoHero {...props} />,
          imoveis: <PorticoImoveis {...props} />,
          about: <PorticoAbout {...props} />,
          depoimentos: <PorticoDepoimentos {...props} />,
          contato: <PorticoContato {...props} />,
          footer: <PorticoFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
