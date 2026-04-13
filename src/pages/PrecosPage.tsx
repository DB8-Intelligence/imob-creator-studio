import { useState, useRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { KIWIFY_CHECKOUT_CRIATIVOS, KIWIFY_CHECKOUT_VIDEOS } from "@/lib/kiwify-links";

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
      <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="text-[#0A1628] font-semibold text-[15px]">{q}</span>
        <span className="shrink-0 text-[#6B7280]">{open ? <Minus size={16} /> : <Plus size={16} />}</span>
      </button>
      <AnimatePresence initial={false}>{open && <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-5 text-[#6B7280] text-sm leading-relaxed">{a}</p></motion.div>}</AnimatePresence>
    </div>
  );
}

interface Plan { name: string; price: number; features: string[]; url: string; highlighted?: boolean; badge?: string }

const criativosPlans: Plan[] = [
  { name: "Starter", price: 97, features: ["50 criativos/mês", "Feed + Story", "Download direto", "Programa de afiliados"], url: KIWIFY_CHECKOUT_CRIATIVOS.starter },
  { name: "Básico", price: 197, highlighted: true, badge: "Mais popular", features: ["100 criativos/mês", "Feed + Story + Reel", "Publicação IG + FB", "Programa de afiliados"], url: KIWIFY_CHECKOUT_CRIATIVOS.basico },
  { name: "PRO", price: 397, features: ["150 criativos/mês", "Todos os formatos", "Publicação IG + FB", "Programa de afiliados"], url: KIWIFY_CHECKOUT_CRIATIVOS.pro },
];
const videosPlans: Plan[] = [
  { name: "Starter", price: 97, features: ["5 vídeos/mês", "Duração até 30s", "3 moods de música", "Download direto"], url: KIWIFY_CHECKOUT_VIDEOS.starter },
  { name: "Básico", price: 197, highlighted: true, badge: "Mais popular", features: ["10 vídeos/mês", "Duração até 60s", "6 moods de música", "Publicação IG Reels"], url: KIWIFY_CHECKOUT_VIDEOS.basico },
  { name: "PRO", price: 397, features: ["20 vídeos/mês", "Duração até 90s", "6 moods de música", "Publicação IG Reels"], url: KIWIFY_CHECKOUT_VIDEOS.pro },
];

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? Math.round(plan.price * 0.8) : plan.price;
  return (
    <motion.div variants={fadeUp} className={`bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all ${plan.highlighted ? "border-2 border-[#002B5B] shadow-[0_4px_20px_rgba(0,43,91,0.1)] relative" : "border-[1.5px] border-[#E5E7EB]"}`}>
      {plan.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#002B5B] text-white">{plan.badge}</span>}
      <div><span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{plan.name}</span><div className="text-3xl font-extrabold text-[#0A1628] mt-1">R${price}<span className="text-sm font-medium text-[#6B7280]">/mês</span></div>{annual && <span className="text-xs text-[#059669] font-medium">20% de desconto</span>}</div>
      <div className="h-px bg-[#E5E7EB]" />
      <ul className="flex flex-col gap-2.5 flex-1">{plan.features.map(f => <li key={f} className="flex items-start gap-2 text-sm text-[#374151]"><Check size={14} className="text-[#002B5B] shrink-0 mt-0.5" />{f}</li>)}</ul>
      <button type="button" onClick={() => window.open(plan.url, "_blank")} className={`w-full py-3 rounded-[10px] font-bold text-sm transition-colors ${plan.highlighted ? "bg-[#002B5B] hover:bg-[#001d3d] text-white" : "bg-white hover:bg-[#F8FAFF] text-[#002B5B] border-[1.5px] border-[#CBD5E1]"}`}>
        Assinar {plan.name}
      </button>
    </motion.div>
  );
}

export default function PrecosPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-28 md:pt-36 pb-16 bg-gradient-to-b from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-[#0A1628] leading-tight mb-4">Planos simples. Sem surpresas.</h1>
          <p className="text-[#6B7280] text-base mb-8">Comece pelos módulos que precisar e adicione mais conforme crescer.</p>
          <div className="inline-flex items-center gap-3 bg-[#F1F5F9] rounded-full p-1">
            <button type="button" onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-white text-[#002B5B] shadow-sm" : "text-[#6B7280]"}`}>Mensal</button>
            <button type="button" onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-white text-[#002B5B] shadow-sm" : "text-[#6B7280]"}`}>Anual <span className="text-[#059669] text-xs">-20%</span></button>
          </div>
        </div>
      </section>

      {/* Criativos */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8"><span className="text-2xl">🎨</span><h2 className="text-2xl font-bold text-[#0A1628]">Criativos</h2><span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Disponível</span></div>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">{criativosPlans.map(p => <PlanCard key={p.name} plan={p} annual={annual} />)}</Reveal>
        </div>
      </section>

      {/* Vídeos */}
      <section className="py-16 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8"><span className="text-2xl">🎬</span><h2 className="text-2xl font-bold text-[#0A1628]">Vídeos</h2><span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Disponível</span></div>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">{videosPlans.map(p => <PlanCard key={p.name} plan={p} annual={annual} />)}</Reveal>
        </div>
      </section>

      {/* Modulos inclusos */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Modulos inclusos no plano</h2>
          <p className="text-[#6B7280] text-sm mb-8">Todos os planos incluem acesso completo a estes modulos imobiliarios.</p>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "🏠", title: "Site + Portais", desc: "10 modelos + SEO", href: "/site-imobiliario" },
              { emoji: "🤝", title: "CRM", desc: "Pipeline Kanban", href: "/crm-imobiliario" },
              { emoji: "📱", title: "WhatsApp", desc: "Inbox + automacoes", href: "/whatsapp-imobiliario" },
              { emoji: "📣", title: "Social", desc: "Agende IG + FB", href: "/publicacao-social" },
            ].map(m => (
              <motion.div key={m.title} variants={fadeUp}>
                <Link to={m.href} className="block bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#002B5B] hover:shadow-md p-6 text-center transition-all">
                  <span className="text-3xl mb-2 block">{m.emoji}</span>
                  <h3 className="text-[#0A1628] font-bold text-base mb-1">{m.title}</h3>
                  <p className="text-[11px] text-[#6B7280] mb-2">{m.desc}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Disponivel</span>
                  <p className="text-[#002B5B] text-sm font-semibold mt-3 inline-flex items-center gap-1">Acessar <ArrowRight size={12} /></p>
                </Link>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-[#0A1628] text-center mb-8">Dúvidas sobre preços</h2>
          {[
            { q: "Posso combinar módulos?", a: "Sim! Cada módulo é independente. Assine Criativos e Vídeos juntos ou separados." },
            { q: "Como funciona o trial?", a: "Todos os planos têm 7 dias de garantia incondicional. Não gostou, devolvemos 100%." },
            { q: "Aceita CNPJ?", a: "Sim, aceitamos pagamentos via CNPJ. Entre em contato pelo WhatsApp para faturamento." },
          ].map(f => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      <section className="py-16 px-6 bg-[#002B5B]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5">Pronto para começar?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px]">Criativos <ArrowRight size={15} /></Link>
            <Link to="/videos" className="inline-flex items-center gap-2 bg-transparent text-white font-bold text-sm px-6 py-3 rounded-[10px] border border-white/30 hover:border-white/60">Vídeos <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
