import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import UrbanoHero from "./UrbanoHero";
import UrbanoImoveis from "./UrbanoImoveis";
import UrbanoAbout from "./UrbanoAbout";
import UrbanoDepoimentos from "./UrbanoDepoimentos";
import UrbanoContato from "./UrbanoContato";
import UrbanoFooter from "./UrbanoFooter";

export default function UrbanoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-[#F9FAFB] font-['Inter',sans-serif] text-gray-800">
      <SectionsWrapper site={props.site}>
        {{
          hero: <UrbanoHero {...props} />,
          imoveis: <UrbanoImoveis {...props} />,
          about: <UrbanoAbout {...props} />,
          depoimentos: <UrbanoDepoimentos {...props} />,
          contato: <UrbanoContato {...props} />,
          footer: <UrbanoFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
