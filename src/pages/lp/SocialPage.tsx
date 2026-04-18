import { useState, useEffect, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";
import { KIWIFY_PRODUCTS, handleKiwifyCheckout } from "@/lib/kiwify-links";

const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

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

const features = [
  "Agendamento por data e hora",
  "Publicação automática IG + FB",
  "CRM de leads das redes sociais",
  "Integração com o dashboard",
  "Conecta quantos perfis precisar",
  "Calendário unificado de publicações",
];

export default function SocialPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const onCheckout = () => handleKiwifyCheckout(KIWIFY_PRODUCTS.addonSocial, { plan: "social", module: "social" });

  return (
    <div className="min-h-screen bg-white text-[#374151]">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm border-b border-[#F0F0F0] shadow-sm" : "bg-white border-b border-transparent"}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <span className="text-xl font-bold text-[#002B5B]" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span>
          </Link>
          <a href="#plano" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors">Assinar agora <ArrowRight size={14} /></a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#EEF2FF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">📣 Social Autopilot · Instagram + Facebook</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[#0A1628] leading-[1.1] tracking-tight">
              Publique no Instagram e Facebook <span className="text-[#002B5B]">no piloto automático</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-xl">
              Agende posts e reels por data e hora. CRM dedicado captura os leads que chegam pelas redes e joga direto no seu pipeline.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-2 text-sm text-[#374151]">
              {["Agende por data e hora", "Quantos perfis quiser", "CRM de leads social"].map((s) => (
                <span key={s} className="flex items-center gap-1.5"><Check size={14} className="text-[#002B5B]" />{s}</span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <a href="#plano" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors mt-2">Ver o plano <ArrowRight size={15} /></a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Fluxo em <span className="text-[#002B5B]">3 passos</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🔗", title: "Conecte seus perfis", desc: "Autorize Instagram e Facebook. Cada perfil é R$29,90/mês." },
              { emoji: "📅", title: "Agende as publicações", desc: "Escolha data e hora. A IA posta sozinha — você nem precisa estar online." },
              { emoji: "💬", title: "Leads no CRM", desc: "Quem comentar ou mandar mensagem cai direto no seu CRM de redes sociais." },
            ].map((s) => (
              <motion.div key={s.title} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 text-center hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <span className="text-3xl mb-3 block">{s.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base mb-1.5">{s.title}</h3>
                <p className="text-[#6B7280] text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Tudo que inclui */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Tudo que está incluso</motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl mx-auto">
            {features.map((f) => (
              <motion.div key={f} variants={fadeUp} className="flex items-start gap-2 text-sm text-[#374151]">
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Plano */}
      <section id="plano" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-md">
          <Reveal className="text-center mb-10 flex flex-col items-center gap-2">
            <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Plano único</motion.span>
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              <span className="text-[#002B5B]">R$ 29,90</span> por perfil conectado
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">7 dias de garantia. Sem fidelidade. Cancele quando quiser.</motion.p>
          </Reveal>
          <Reveal>
            <motion.div variants={fadeUp} className="relative bg-white rounded-2xl border-2 border-[#0A1628] p-8 shadow-[0_10px_40px_rgba(0,43,91,0.12)]">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                📣 Social Autopilot
              </span>

              <div className="text-center mt-3">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-[#0A1628]">R$ 29,90</span>
                  <span className="text-base text-[#6B7280] font-medium">/perfil</span>
                </div>
                <p className="text-[#6B7280] text-xs mt-2">Instagram e Facebook contam como perfis separados</p>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] font-black py-4 rounded-xl transition-all text-base hover:-translate-y-0.5 shadow-[0_10px_20px_rgba(255,215,0,0.2)]"
              >
                Conectar meu perfil <ArrowRight size={18} />
              </button>

              <ul className="mt-8 space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Dúvidas frequentes</motion.h2>
          </Reveal>
          {[
            { q: "Como é a cobrança por perfil?", a: "R$29,90 por perfil conectado. Se você usar Instagram + Facebook, são 2 perfis = R$59,80/mês. Conecte quantos precisar." },
            { q: "O CRM de redes sociais está incluído?", a: "Sim. Assinou o Social Autopilot, ganhou o CRM que captura os leads de comentários e DMs direto no dashboard." },
            { q: "Posso combinar com outros produtos NexoImob?", a: "Sim. Se tiver Criativos ou Vídeos, por exemplo, basta mandar a peça pro Social Autopilot agendar. Tudo no mesmo painel." },
            { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele por perfil individualmente, quando quiser." },
          ].map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">Deixe a publicação no automático</h2>
            <button
              type="button"
              onClick={onCheckout}
              className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors"
            >
              Conectar meu perfil <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#E5E7EB] bg-white">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#6B7280] text-xs">
          <span>&copy; 2026 NexoImob AI. Todos os direitos reservados.</span>
          <div className="flex gap-5">
            <Link to="/termos" className="hover:text-[#002B5B] transition-colors">Termos de Uso</Link>
            <Link to="/termos" className="hover:text-[#002B5B] transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
