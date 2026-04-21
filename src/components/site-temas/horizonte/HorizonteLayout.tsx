import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import HorizonteHero from "./HorizonteHero";
import HorizonteImoveis from "./HorizonteImoveis";
import HorizonteAbout from "./HorizonteAbout";
import HorizonteDepoimentos from "./HorizonteDepoimentos";
import HorizonteContato from "./HorizonteContato";
import HorizonteFooter from "./HorizonteFooter";

export default function HorizonteLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <HorizonteHero {...props} />,
          imoveis: <HorizonteImoveis {...props} />,
          about: <HorizonteAbout {...props} />,
          depoimentos: <HorizonteDepoimentos {...props} />,
          contato: <HorizonteContato {...props} />,
          footer: <HorizonteFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
