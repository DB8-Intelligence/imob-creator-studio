import type { TemaProps } from "../tipos";
import UrbanoHero from "./UrbanoHero";
import UrbanoImoveis from "./UrbanoImoveis";
import UrbanoAbout from "./UrbanoAbout";
import UrbanoDepoimentos from "./UrbanoDepoimentos";
import UrbanoContato from "./UrbanoContato";
import UrbanoFooter from "./UrbanoFooter";

export default function UrbanoLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-[#F9FAFB] font-['Inter',sans-serif] text-gray-800">
      <UrbanoHero {...props} />
      <UrbanoImoveis {...props} />
      <UrbanoAbout {...props} />
      <UrbanoDepoimentos {...props} />
      <UrbanoContato {...props} />
      <UrbanoFooter {...props} />
    </div>
  );
}
