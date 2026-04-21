import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import OnixHero from "./OnixHero";
import OnixImoveis from "./OnixImoveis";
import OnixAbout from "./OnixAbout";
import OnixDepoimentos from "./OnixDepoimentos";
import OnixContato from "./OnixContato";
import OnixFooter from "./OnixFooter";

export default function OnixLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-900">
      <SectionsWrapper site={props.site}>
        {{
          hero: <OnixHero {...props} />,
          imoveis: <OnixImoveis {...props} />,
          about: <OnixAbout {...props} />,
          depoimentos: <OnixDepoimentos {...props} />,
          contato: <OnixContato {...props} />,
          footer: <OnixFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
