import type { TemaProps } from "../tipos";
import FarolHero from "./FarolHero";
import FarolImoveis from "./FarolImoveis";
import FarolAbout from "./FarolAbout";
import FarolDepoimentos from "./FarolDepoimentos";
import FarolContato from "./FarolContato";
import FarolFooter from "./FarolFooter";

export default function FarolLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <FarolHero {...props} />
      <FarolImoveis {...props} />
      <FarolAbout {...props} />
      <FarolDepoimentos {...props} />
      <FarolContato {...props} />
      <FarolFooter {...props} />
    </div>
  );
}
