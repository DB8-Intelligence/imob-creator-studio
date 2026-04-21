import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import FarolHero from "./FarolHero";
import FarolImoveis from "./FarolImoveis";
import FarolAbout from "./FarolAbout";
import FarolDepoimentos from "./FarolDepoimentos";
import FarolContato from "./FarolContato";
import FarolFooter from "./FarolFooter";

export default function FarolLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <FarolHero {...props} />,
          imoveis: <FarolImoveis {...props} />,
          about: <FarolAbout {...props} />,
          depoimentos: <FarolDepoimentos {...props} />,
          contato: <FarolContato {...props} />,
          footer: <FarolFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
