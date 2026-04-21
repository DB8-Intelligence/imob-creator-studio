import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import PrismaHero from "./PrismaHero";
import PrismaImoveis from "./PrismaImoveis";
import PrismaAbout from "./PrismaAbout";
import PrismaDepoimentos from "./PrismaDepoimentos";
import PrismaContato from "./PrismaContato";
import PrismaFooter from "./PrismaFooter";

export default function PrismaLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <PrismaHero {...props} />,
          imoveis: <PrismaImoveis {...props} />,
          about: <PrismaAbout {...props} />,
          depoimentos: <PrismaDepoimentos {...props} />,
          contato: <PrismaContato {...props} />,
          footer: <PrismaFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
