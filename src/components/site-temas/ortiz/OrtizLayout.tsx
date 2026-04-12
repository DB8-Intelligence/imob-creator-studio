import type { TemaProps } from "../tipos";
import OrtizHero from "./OrtizHero";
import OrtizImoveis from "./OrtizImoveis";
import OrtizAbout from "./OrtizAbout";
import OrtizDepoimentos from "./OrtizDepoimentos";
import OrtizContato from "./OrtizContato";
import OrtizFooter from "./OrtizFooter";

export default function OrtizLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-[#252525]">
      <OrtizHero {...props} />
      <OrtizImoveis {...props} />
      <OrtizAbout {...props} />
      <OrtizDepoimentos {...props} />
      <OrtizContato {...props} />
      <OrtizFooter {...props} />
    </div>
  );
}
