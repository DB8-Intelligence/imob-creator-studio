import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import BrisaHero from "./BrisaHero";
import BrisaImoveis from "./BrisaImoveis";
import BrisaAbout from "./BrisaAbout";
import BrisaDepoimentos from "./BrisaDepoimentos";
import BrisaContato from "./BrisaContato";
import BrisaFooter from "./BrisaFooter";

export default function BrisaLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Plus_Jakarta_Sans',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <BrisaHero {...props} />,
          imoveis: <BrisaImoveis {...props} />,
          about: <BrisaAbout {...props} />,
          depoimentos: <BrisaDepoimentos {...props} />,
          contato: <BrisaContato {...props} />,
          footer: <BrisaFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
