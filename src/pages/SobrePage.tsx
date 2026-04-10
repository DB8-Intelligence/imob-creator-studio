import { useRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>{children}</motion.div>;
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <motion.div variants={fadeUp}><span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">🏢 Sobre a NexoImob AI</span></motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-[#0A1628] leading-tight">A empresa por trás da NexoImob AI</motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-lg">Democratizar o marketing digital imobiliário no Brasil com inteligência artificial.</motion.p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-4">Nossa Missão</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                Acreditamos que todo corretor de imóveis merece ter acesso a ferramentas profissionais de marketing digital. A NexoImob AI nasceu para eliminar a dependência de designers, editores de vídeo e agências caras.
              </p>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Com inteligência artificial treinada especificamente para o mercado imobiliário brasileiro, automatizamos a criação de posts, vídeos, sites e a gestão de leads — tudo em uma única plataforma.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-[#F8FAFF] rounded-2xl border border-[#E5E7EB] p-8">
              <h3 className="text-lg font-bold text-[#0A1628] mb-4">Dados da Empresa</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">Razão Social</dt><dd className="text-[#0A1628] font-medium">DB8 INTERPRICE COMERCIO E SERVICOS LTDA</dd></div>
                <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">CNPJ</dt><dd className="text-[#0A1628] font-medium">31.982.768/0001-31</dd></div>
                <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">Sede</dt><dd className="text-[#0A1628] font-medium">Salvador, BA</dd></div>
                <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">Fundador</dt><dd className="text-[#0A1628] font-medium">Douglas Bonanza Machado Brito</dd><dd className="text-[#6B7280] text-xs">Contador e Corretor de Imóveis (CRECI/BA)</dd></div>
              </dl>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="text-center mb-10"><motion.h2 variants={fadeUp} className="text-2xl font-bold text-[#0A1628]">Nossa trajetória</motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { year: "2018", title: "Fundação", desc: "DB8 INTERPRICE nasce em Salvador com foco em tecnologia e serviços para o mercado imobiliário." },
              { year: "2024", title: "Pivot para IA", desc: "Identificamos o gap de marketing digital para corretores e começamos a desenvolver soluções com IA." },
              { year: "2026", title: "NexoImob AI", desc: "Lançamento da plataforma completa: Criativos, Vídeos, Site, CRM e WhatsApp integrados." },
            ].map(t => (
              <motion.div key={t.year} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 text-center">
                <span className="text-3xl font-extrabold text-[#002B5B]">{t.year}</span>
                <h3 className="text-[#0A1628] font-bold text-base mt-2 mb-1">{t.title}</h3>
                <p className="text-[#6B7280] text-sm">{t.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="text-center mb-10"><motion.h2 variants={fadeUp} className="text-2xl font-bold text-[#0A1628]">Nossos valores</motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "⚡", title: "Tecnologia", desc: "IA de ponta aplicada ao mercado imobiliário brasileiro." },
              { emoji: "🤝", title: "Acessibilidade", desc: "Preços justos para que todo corretor tenha acesso." },
              { emoji: "🎯", title: "Foco no corretor", desc: "Cada funcionalidade pensada para quem vende imóveis." },
            ].map(v => (
              <motion.div key={v.title} variants={fadeUp} className="bg-[#F8FAFF] rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 text-center">
                <span className="text-3xl mb-2 block">{v.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base mb-1">{v.title}</h3>
                <p className="text-[#6B7280] text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#002B5B]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5">Junte-se a nós</h2>
          <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px]">Começar agora <ArrowRight size={15} /></Link>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
