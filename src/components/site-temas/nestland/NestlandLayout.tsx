import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import NestlandHero from "./NestlandHero";
import NestlandImoveis from "./NestlandImoveis";
import NestlandAbout from "./NestlandAbout";
import NestlandDepoimentos from "./NestlandDepoimentos";
import NestlandContato from "./NestlandContato";
import NestlandFooter from "./NestlandFooter";

export default function NestlandLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-[#f7f4f1] font-['Jost',sans-serif] text-[#0f0f0f]">
      <SectionsWrapper site={props.site}>
        {{
          hero: <NestlandHero {...props} />,
          imoveis: <NestlandImoveis {...props} />,
          about: <NestlandAbout {...props} />,
          depoimentos: <NestlandDepoimentos {...props} />,
          contato: <NestlandContato {...props} />,
          footer: <NestlandFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
