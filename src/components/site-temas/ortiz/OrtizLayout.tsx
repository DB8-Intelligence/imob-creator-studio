import type { TemaProps } from "../tipos";
import SectionsWrapper from "../SectionsWrapper";
import OrtizHero from "./OrtizHero";
import OrtizImoveis from "./OrtizImoveis";
import OrtizAbout from "./OrtizAbout";
import OrtizDepoimentos from "./OrtizDepoimentos";
import OrtizContato from "./OrtizContato";
import OrtizFooter from "./OrtizFooter";

export default function OrtizLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-[#252525]">
      <SectionsWrapper site={props.site}>
        {{
          hero: <OrtizHero {...props} />,
          imoveis: <OrtizImoveis {...props} />,
          about: <OrtizAbout {...props} />,
          depoimentos: <OrtizDepoimentos {...props} />,
          contato: <OrtizContato {...props} />,
          footer: <OrtizFooter {...props} />,
        }}
      </SectionsWrapper>
    </div>
  );
}
