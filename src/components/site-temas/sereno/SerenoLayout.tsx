import type { TemaProps } from "../tipos";
import SerenoHero from "./SerenoHero";
import SerenoImoveis from "./SerenoImoveis";
import SerenoAbout from "./SerenoAbout";
import SerenoDepoimentos from "./SerenoDepoimentos";
import SerenoContato from "./SerenoContato";
import SerenoFooter from "./SerenoFooter";

export default function SerenoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-[#FAFAF7] font-['Inter',sans-serif] text-gray-800">
      <SerenoHero {...props} />
      <SerenoImoveis {...props} />
      <SerenoAbout {...props} />
      <SerenoDepoimentos {...props} />
      <SerenoContato {...props} />
      <SerenoFooter {...props} />
    </div>
  );
}
