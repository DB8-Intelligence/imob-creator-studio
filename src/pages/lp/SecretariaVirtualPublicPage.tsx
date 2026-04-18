import { useState, useEffect, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";

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
  {
    name: "Smart",
    price: "R$ 51,40",
    period: "/mês · 12x",
    features: [
      "Secretária IA rodando 24/7",
      "Atendimento por áudio e texto",
      "Pré-qualificação automática",
      "Respostas baseadas no seu portfólio",
      "Integração Google Agenda",
    ],
    cta: "Assinar Smart",
  },
  {
    name: "Plus",
    price: "R$ 79,90",
    period: "/mês · 12x",
    highlighted: true,
    badge: "Mais popular",
    features: [
      "Tudo do plano Smart",
      "Clonagem da sua voz (áudios)",
      "Disparos em massa + agendados",
      "Follow-up automático com IA",
      "Bônus: Masterclass Tráfego Pago",
      "Bônus: Pack Canva Imobiliário",
    ],
    cta: "Assinar Plus",
  },
] as const;

export default function SecretariaVirtualPublicPage() {
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
          <a href="#planos" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors">Quero minha IA <ArrowRight size={14} /></a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F0FFF4] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#166534]">
                🤖 Secretária Virtual 24h · IA Humanizada
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[#0A1628] leading-[1.1] tracking-tight">
              Transforme seu WhatsApp em uma <span className="text-[#002B5B]">máquina de vendas imobiliárias</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-xl">
              Uma secretária virtual 24/7 que atende por áudio e texto, qualifica o lead e agenda a visita direto na sua agenda — enquanto você fecha o próximo imóvel.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-2 text-sm text-[#374151]">
              {["Atende áudios", "Google Agenda", "Voz clonada"].map((s) => (
                <span key={s} className="flex items-center gap-1.5"><Check size={14} className="text-[#059669]" />{s}</span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3">
              <a href="#planos" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors">
                Quero vender mais <ArrowRight size={15} />
              </a>
              <a href="#como-funciona" className="inline-flex items-center gap-2 bg-white text-[#002B5B] font-bold text-sm px-7 py-3.5 rounded-[10px] border-[1.5px] border-[#CBD5E1] hover:bg-[#F8FAFF] transition-colors">
                Ver como funciona
              </a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Como funciona em <span className="text-[#002B5B]">3 passos</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", emoji: "📱", title: "Conecte seu WhatsApp", desc: "Escaneie o QR Code e defina o tom de voz da IA em menos de 3 minutos." },
              { n: "02", emoji: "🤖", title: "A IA atende e qualifica", desc: "Responde áudios e textos, tira dúvidas e confirma interesse do lead." },
              { n: "03", emoji: "📅", title: "Visita na sua agenda", desc: "Agendamento automático no Google Calendar. Você só aparece para fechar." },
            ].map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 text-center hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <span className="text-3xl mb-3 block">{s.emoji}</span>
                <div className="text-xs font-bold tracking-widest text-[#6B7280] mb-1">{s.n}</div>
                <h3 className="text-[#0A1628] font-bold text-base mb-1.5">{s.title}</h3>
                <p className="text-[#6B7280] text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Tudo que uma secretária faria — <span className="text-[#002B5B]">24 horas por dia</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base mt-2 max-w-xl mx-auto">
              IA 100% imobiliária. Não é bot genérico reaproveitado de e-commerce.
            </motion.p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: "🎙️", title: "Atende áudio + texto", desc: "Cliente manda áudio, a IA ouve, entende e responde. Como uma secretária humana." },
              { emoji: "⚡", title: "Pré-qualificação de leads", desc: "Descobre orçamento, região e prazo antes de te avisar. Você só fala com lead quente." },
              { emoji: "📅", title: "Integração Google Agenda", desc: "Marca a visita no horário livre. Sem conflito, sem no-show esquecido." },
              { emoji: "🔊", title: "Clonagem de voz", desc: "Grave sua voz uma vez. A IA manda áudios com o seu timbre — escala sem perder humanidade." },
              { emoji: "💬", title: "Quick replies salvas", desc: "Respostas prontas por etapa (primeiro contato, nutrição, fechamento). Você só ajusta o essencial." },
              { emoji: "🔁", title: "Follow-up automático", desc: "Reengaja clientes que sumiram. A IA analisa a conversa e manda a mensagem certa no momento certo." },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <span className="text-2xl mb-3 block">{f.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base mb-1.5">{f.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Feito para quem vive de <span className="text-[#002B5B]">vender imóvel</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "👤", title: "Corretor autônomo", desc: "Nunca mais perca lead por não conseguir responder rápido." },
              { emoji: "🏢", title: "Imobiliária", desc: "Padroniza o atendimento do time inteiro e não depende de plantonista." },
              { emoji: "👥", title: "Equipe de vendas", desc: "Distribui lead qualificado direto para quem está livre para visitar." },
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

      {/* Prova social */}
      <section className="py-20 px-6 bg-[#002B5B]">
        <div className="container mx-auto max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-6">
            <motion.div variants={fadeUp}>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#FFD700]">Corretores reais</span>
            </motion.div>
            <motion.blockquote variants={fadeUp} className="text-xl md:text-2xl text-white leading-relaxed font-medium">
              "O agendamento de mensagens me ajudou a fechar com leads que eu tinha esquecido. Hoje a IA trabalha enquanto eu mostro imóvel."
            </motion.blockquote>
            <motion.div variants={fadeUp} className="text-white/70 text-sm">
              Emiliana Ludwig · Corretora · Salvador, BA
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 px-6 bg-[#F8FAFF] scroll-mt-20">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-2">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Escolha o plano da sua IA
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">7 dias de garantia. Sem fidelidade. Cancele quando quiser.</motion.p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className={`bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all ${p.highlighted ? "border-2 border-[#002B5B] shadow-[0_4px_20px_rgba(0,43,91,0.1)] relative" : "border-[1.5px] border-[#E5E7EB]"}`}>
                {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#002B5B] text-white">{p.badge}</span>}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{p.name}</span>
                  <div className="text-3xl font-extrabold text-[#0A1628] mt-1">{p.price}<span className="text-sm font-medium text-[#6B7280]">{p.period}</span></div>
                </div>
                <div className="h-px bg-[#E5E7EB]" />
                <ul className="flex flex-col gap-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#374151]"><Check size={14} className="text-[#002B5B] shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <Link to="/lp/secretaria-virtual#oferta" className={`w-full py-3 rounded-[10px] font-bold text-sm transition-colors text-center ${p.highlighted ? "bg-[#002B5B] hover:bg-[#001d3d] text-white" : "bg-white hover:bg-[#F8FAFF] text-[#002B5B] border-[1.5px] border-[#CBD5E1]"}`}>
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Dúvidas frequentes</motion.h2>
          </Reveal>
          {[
            { q: "Meu computador precisa ficar ligado 24h?", a: "Não. A IA roda 100% na nuvem. Pode desligar o PC que ela continua atendendo pelo seu WhatsApp." },
            { q: "A IA responde áudio mesmo?", a: "Sim. O cliente manda áudio, a IA transcreve, entende o contexto imobiliário e responde por texto ou áudio (com a sua voz, se você ativar a clonagem)." },
            { q: "É fácil de configurar?", a: "Em menos de 5 minutos: QR code no WhatsApp, tom de voz da IA, horários de atendimento e pronto. Sem instalar nada." },
            { q: "E se a IA não souber responder?", a: "Ela te passa o bastão automaticamente e avisa no seu próprio WhatsApp com o resumo da conversa. Zero lead perdido." },
            { q: "Posso cancelar quando quiser?", a: "Sim. Sem fidelidade e com 7 dias de garantia incondicional." },
          ].map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              Pronto para parar de perder lead no WhatsApp?
            </h2>
            <p className="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Enquanto você lê isso, sua IA poderia estar atendendo 3 clientes ao mesmo tempo.
            </p>
            <a href="#planos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-7 py-3.5 rounded-[10px] transition-colors">
              Ativar minha Secretária IA <ArrowRight size={15} />
            </a>
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
