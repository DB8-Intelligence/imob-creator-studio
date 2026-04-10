import { useState, useEffect, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";

const CHECKOUT = {
  starter: "https://pay.kiwify.com.br/UjBaKio",
  basico:  "https://pay.kiwify.com.br/gCd9MsZ",
  pro:     "https://pay.kiwify.com.br/2ofOTll",
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>{children}</motion.div>;
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="text-[#0A1628] font-semibold text-[15px]">{q}</span>
        <span className="shrink-0 text-[#6B7280]">{open ? <Minus size={16} /> : <Plus size={16} />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="pb-5 text-[#6B7280] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const plans = [
  { name: "Starter", price: "R$97", features: ["50 criativos/mês", "Feed + Story", "Download direto", "Programa de afiliados"], url: CHECKOUT.starter },
  { name: "Básico", price: "R$197", highlighted: true, badge: "Mais popular", features: ["100 criativos/mês", "Feed + Story + Reel", "Publicação IG + FB", "Programa de afiliados"], url: CHECKOUT.basico },
  { name: "PRO", price: "R$397", features: ["150 criativos/mês", "Todos os formatos", "Publicação IG + FB", "Programa de afiliados"], url: CHECKOUT.pro },
];

export default function CriativosPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#374151]">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm border-b border-[#F0F0F0] shadow-sm" : "bg-white border-b border-transparent"}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="shrink-0"><span className="text-xl font-bold text-[#002B5B]" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span></Link>
          <a href="#planos" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors">Começar Agora <ArrowRight size={14} /></a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <motion.div variants={fadeUp}><span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">🎨 IA para Criativos Imobiliários</span></motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[#0A1628] leading-[1.1] tracking-tight">Crie posts de imóveis com IA em 30 segundos</motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-lg">Templates exclusivos para corretor. Sem designer, sem Canva, sem demora.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-2 text-sm text-[#374151]">
              {["50 artes/mês", "6 formatos", "100% automático"].map((s) => (
                <span key={s} className="flex items-center gap-1.5"><Check size={14} className="text-[#002B5B]" />{s}</span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}><a href="#planos" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors mt-2">Começar Agora <ArrowRight size={15} /></a></motion.div>
          </Reveal>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Como funciona em <span className="text-[#002B5B]">3 passos</span></motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", emoji: "📸", title: "Envie a foto do imóvel", desc: "Arraste ou cole a URL. Qualquer formato." },
              { n: "02", emoji: "🤖", title: "IA cria o criativo", desc: "Template, estilo e cores da sua marca." },
              { n: "03", emoji: "⬇️", title: "Baixe ou publique", desc: "Download, WhatsApp ou direto no Instagram." },
            ].map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 text-center hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <span className="text-3xl mb-3 block">{s.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base mb-1.5">{s.title}</h3>
                <p className="text-[#6B7280] text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Estilos */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">6 estilos profissionais <span className="text-[#002B5B]">prontos para usar</span></motion.h2></Reveal>
          <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Dark Premium", "IA Express", "Imobiliário Top", "Clássico Elegante", "Black Gold Tower", "Captação Express"].map((s) => (
              <motion.div key={s} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 text-center hover:border-[#002B5B] transition-all min-h-[120px] flex flex-col items-center justify-center gap-2">
                <h3 className="text-[#0A1628] font-semibold text-sm">{s}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">Disponível</span>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Feito para profissionais <span className="text-[#002B5B]">do mercado imobiliário</span></motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "👤", title: "Corretor solo", desc: "Não depende mais de designer." },
              { emoji: "🏢", title: "Imobiliária", desc: "Padroniza a identidade visual do time." },
              { emoji: "📱", title: "Social Media", desc: "Entrega conteúdo imobiliário em escala." },
            ].map((a) => (
              <motion.div key={a.title} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 text-center hover:border-[#002B5B] transition-all">
                <span className="text-4xl mb-3 block">{a.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base">{a.title}</h3>
                <p className="text-[#6B7280] text-sm mt-1">{a.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 px-6 bg-[#F8FAFF] scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-2">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Escolha o plano ideal</motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">Todos com 7 dias de garantia. Cancele quando quiser.</motion.p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className={`bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all ${p.highlighted ? "border-2 border-[#002B5B] shadow-[0_4px_20px_rgba(0,43,91,0.1)] relative" : "border-[1.5px] border-[#E5E7EB]"}`}>
                {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#002B5B] text-white">{p.badge}</span>}
                <div><span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{p.name}</span><div className="text-3xl font-extrabold text-[#0A1628] mt-1">{p.price}<span className="text-sm font-medium text-[#6B7280]">/mês</span></div></div>
                <div className="h-px bg-[#E5E7EB]" />
                <ul className="flex flex-col gap-2.5 flex-1">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-[#374151]"><Check size={14} className="text-[#002B5B] shrink-0 mt-0.5" />{f}</li>)}
                </ul>
                <button type="button" onClick={() => window.open(p.url, "_blank")} className={`w-full py-3 rounded-[10px] font-bold text-sm transition-colors ${p.highlighted ? "bg-[#002B5B] hover:bg-[#001d3d] text-white" : "bg-white hover:bg-[#F8FAFF] text-[#002B5B] border-[1.5px] border-[#CBD5E1]"}`}>
                  Assinar {p.name}
                </button>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Dúvidas frequentes</motion.h2></Reveal>
          {[
            { q: "Preciso saber editar?", a: "Não, tudo é automático. Envie a foto e a IA faz todo o trabalho." },
            { q: "Funciona para qual tipo de imóvel?", a: "Todos — apartamentos, casas, terrenos, salas comerciais, galpões." },
            { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele a qualquer momento." },
            { q: "Tem período de teste?", a: "7 dias de garantia incondicional. Não gostou, devolvemos tudo." },
          ].map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">Pronto para criar 50 artes profissionais por mês?</h2>
            <a href="#planos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors">Ver Planos <ArrowRight size={15} /></a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#E5E7EB] bg-white">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#6B7280] text-xs">
          <span>&copy; 2026 NexoImob AI. Todos os direitos reservados.</span>
          <div className="flex gap-5"><Link to="/termos" className="hover:text-[#002B5B] transition-colors">Termos de Uso</Link><Link to="/termos" className="hover:text-[#002B5B] transition-colors">Privacidade</Link></div>
        </div>
      </footer>
    </div>
  );
}
