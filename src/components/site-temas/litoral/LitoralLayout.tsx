import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import LitoralHero from "./LitoralHero";
import LitoralImoveis from "./LitoralImoveis";
import LitoralAbout from "./LitoralAbout";
import LitoralDepoimentos from "./LitoralDepoimentos";
import LitoralContato from "./LitoralContato";
import LitoralFooter from "./LitoralFooter";

export default function LitoralLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Nunito',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <LitoralHero {...props} />,
          imoveis: <LitoralImoveis {...props} />,
          about: <LitoralAbout {...props} />,
          depoimentos: <LitoralDepoimentos {...props} />,
          contato: <LitoralContato {...props} />,
          footer: <LitoralFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
