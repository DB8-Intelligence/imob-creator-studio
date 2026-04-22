import { useState, useRef, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, AnimatePresence, Variants } from "framer-motion";
import { Plus, Minus, ArrowRight, MessageCircle, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CountUp } from "@/components/ui/CountUp";

// ── Animations ───────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
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

// ── URLs ─────────────────────────────────────────────────────────────────────
const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20NexoImob";

// ── Produtos ─────────────────────────────────────────────────────────────────
// Cada produto tem sua própria LP com planos e CTAs de compra.
type Product = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  startingAt: string;
  priceDetail: string;
  bullets: string[];
  href: string;
  accent: "gold" | "navy";
};

const products: Product[] = [
  {
    id: "site",
    icon: "🏠",
    name: "Site Imobiliário",
    tagline: "Site + CRM + Portais XML",
    startingAt: "R$ 147",
    priceDetail: "/mês",
    bullets: [
      "1 Site Imobiliário",
      "CRM Completo + Funil de vendas",
      "Cadastro de imóveis ilimitados",
      "Integração automática com portais (OLX, ZAP, VivaReal)",
      "Customer Success dedicado",
      "+59 funcionalidades",
    ],
    href: "/site-imobiliario",
    accent: "gold",
  },
  {
    id: "secretaria",
    icon: "🤖",
    name: "Secretária Virtual 24h",
    tagline: "IA atende WhatsApp com sua voz",
    startingAt: "R$ 51,40",
    priceDetail: "/mês · 12x",
    bullets: [
      "Secretária virtual 24/7",
      "IA responde por áudios e textos",
      "Clonagem da sua voz (Plus)",
      "Integração Google Agenda",
      "CRM WhatsApp + disparos em massa (Plus)",
    ],
    href: "/secretaria-virtual",
    accent: "navy",
  },
  {
    id: "criativos",
    icon: "🎨",
    name: "Criativos com IA",
    tagline: "Posts, stories e reels automáticos",
    startingAt: "R$ 97",
    priceDetail: "/mês",
    bullets: [
      "50 a 150 criativos por mês",
      "Feed + Story + Reel",
      "Download direto ou publicação IG+FB",
      "Programa de afiliados incluso",
    ],
    href: "/criativos",
    accent: "navy",
  },
  {
    id: "criativos_pro",
    icon: "⚡",
    name: "Criativos Pro",
    tagline: "Foto no Zap → post no Instagram em 1 minuto",
    startingAt: "Sob consulta",
    priceDetail: "",
    bullets: [
      "Corretor manda foto+legenda no próprio WhatsApp",
      "IA gera copy, CTA, hashtags e arte em ~30s",
      "Aprovação no Zap (👍/👎) ou no dashboard",
      "Publicação automática no Instagram ao aprovar",
      "Upgrade sobre qualquer plano",
    ],
    href: WHATSAPP_LINK,
    accent: "navy",
  },
  {
    id: "videos",
    icon: "🎬",
    name: "Vídeos com IA",
    tagline: "Reels cinematográficos das suas fotos",
    startingAt: "R$ 97",
    priceDetail: "/mês",
    bullets: [
      "5 a 20 vídeos por mês",
      "Até 90s de duração",
      "Até 6 moods de música",
      "Publicação direta no Instagram Reels",
    ],
    href: "/videos",
    accent: "navy",
  },
  {
    id: "social",
    icon: "📣",
    name: "Social Autopilot",
    tagline: "Publicação automática IG + FB",
    startingAt: "R$ 29,90",
    priceDetail: "/perfil",
    bullets: [
      "Agendamento por data e hora",
      "CRM de leads das redes sociais",
      "Integração com o dashboard",
      "Conecta quantos perfis precisar",
    ],
    href: "/publicacao-social",
    accent: "navy",
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqItems = [
  { q: "Posso combinar mais de um produto?", a: "Sim! Todos os produtos vivem no mesmo dashboard em abas separadas. Se você assinar Criativos + Vídeos + Site, por exemplo, tudo aparece unificado no seu painel, e o CRM consolida os leads das diferentes origens (portais, redes sociais e WhatsApp)." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Não há fidelidade em nenhum produto. Cancele quando quiser pelo painel ou enviando e-mail ao suporte. Seu acesso permanece ativo até o fim do período pago." },
  { q: "Como funciona o pagamento?", a: "Aceitamos cartão de crédito (parcelamento em 12x disponível nos planos anuais), PIX e boleto bancário. O pagamento é processado pela Kiwify, plataforma segura e confiável." },
  { q: "O Site Imobiliário já vem com CRM?", a: "Sim. O plano do Site (R$147/mês) já inclui o CRM completo para gerenciar os leads que chegam pelos portais integrados (OLX, ZAP, VivaReal) e pelo próprio site." },
  { q: "A Secretária AI substitui a pessoa que atende WhatsApp?", a: "A Secretária atende 24h por dia com a sua voz clonada, qualifica leads, agenda visitas no Google Calendar e envia mídias. No plano Plus, você ganha também o CRM do WhatsApp para acompanhar toda a operação de atendimento." },
  { q: "Tenho garantia?", a: "Sim. 7 dias de garantia em todos os produtos. Se não for pra você, devolvemos 100% do valor." },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PrecosPage() {
  const location = useLocation();
  const missingModule = (location.state as { missingModule?: string } | null)?.missingModule;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 px-4 text-center">
        {missingModule && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-sm text-yellow-800">
              🔒 Você precisa do produto <strong>{missingModule}</strong> para acessar essa funcionalidade.
              Veja as opções abaixo.
            </p>
          </div>
        )}
        <Reveal>
          <motion.span variants={fadeUp} className="inline-block py-1.5 px-4 rounded-full bg-[#FFF7E0] text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-4">
            Planos e Preços
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold text-[#0A1628] leading-tight max-w-3xl mx-auto">
            Escolha o que combina com a sua operação
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-[#6B7280] max-w-2xl mx-auto">
            Cada produto é independente. Contrate só o que precisa, combine como quiser. Tudo integrado no mesmo dashboard. Sem fidelidade.
          </motion.p>
        </Reveal>
      </section>

      {/* ── Grid de Produtos ──────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const isHighlighted = p.accent === "gold";
              const isMatch = missingModule && p.id === missingModule;
              return (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className={`relative bg-white rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all h-full flex flex-col ${
                    isHighlighted ? "border-2 border-[#FFD700] lg:scale-[1.02]" : "border border-[#E5E7EB]"
                  } ${isMatch ? "ring-2 ring-[#FFD700] shadow-xl animate-pulse" : ""}`}
                >
                  {isHighlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      ⭐ Mais popular
                    </span>
                  )}

                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="text-xl font-bold text-[#0A1628]">{p.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{p.tagline}</p>

                  <div className="mt-5 mb-4">
                    <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold">A partir de</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-[#0A1628]">{p.startingAt}</span>
                      <span className="text-sm text-[#6B7280]">{p.priceDetail}</span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[#374151]">
                        <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {p.href.startsWith("http") ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all text-sm ${
                        isHighlighted
                          ? "bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] shadow-md hover:-translate-y-0.5"
                          : "bg-[#0A1628] hover:bg-[#162038] text-white"
                      }`}
                    >
                      Falar com consultor <MessageCircle size={16} />
                    </a>
                  ) : (
                    <Link
                      to={p.href}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all text-sm ${
                        isHighlighted
                          ? "bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] shadow-md hover:-translate-y-0.5"
                          : "bg-[#0A1628] hover:bg-[#162038] text-white"
                      }`}
                    >
                      Ver planos e contratar <ArrowRight size={16} />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ── Integração / Dashboard único ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#F8FAFF]">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-extrabold text-[#0A1628] mb-4">
              Combine como quiser. Tudo no mesmo lugar.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base max-w-2xl mx-auto">
              Se você contratar Site + Secretária AI + Criativos, tudo aparece no mesmo dashboard em abas separadas. O CRM unifica leads de portais, redes sociais e WhatsApp em uma única visão — com o filtro de origem que você precisar.
            </motion.p>
          </Reveal>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <CountUp end={3500} prefix="+" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">corretores atendidos</p>
          </div>
          <div>
            <CountUp end={40} prefix="+" suffix="h" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">economizadas por mês</p>
          </div>
          <div>
            <CountUp end={25} prefix="+" suffix="%" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">de alcance digital</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#F9FAFB]">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-[#0A1628] text-center mb-8">
              Perguntas frequentes
            </motion.h2>
          </Reveal>
          <div>
            {faqItems.map((item) => (
              <Accordion key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0A1628]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Não tem certeza de qual combo é ideal?
          </h2>
          <p className="text-white/70 text-base mb-6">
            Fala com nosso time. A gente te ajuda a montar o pacote que faz sentido pra tua operação.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] font-bold py-3.5 px-8 rounded-xl transition-colors text-base"
          >
            <MessageCircle size={18} /> Falar com um consultor
          </a>
        </div>
      </section>

      {/* ── Garantia ──────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-full border border-emerald-200">
            ✅ 7 dias de garantia em todos os produtos
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
