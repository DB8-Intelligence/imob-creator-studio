import type { TemaProps } from "../tipos";
import PrismaHero from "./PrismaHero";
import PrismaImoveis from "./PrismaImoveis";
import PrismaAbout from "./PrismaAbout";
import PrismaDepoimentos from "./PrismaDepoimentos";
import PrismaContato from "./PrismaContato";
import PrismaFooter from "./PrismaFooter";

export default function PrismaLayout(props: TemaProps) {
  return (
    <div className="min-h-full w-full bg-white font-['Inter',sans-serif] text-gray-800">
      <PrismaHero {...props} />
      <PrismaImoveis {...props} />
      <PrismaAbout {...props} />
      <PrismaDepoimentos {...props} />
      <PrismaContato {...props} />
      <PrismaFooter {...props} />
    </div>
  );
}
