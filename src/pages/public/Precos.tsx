import { useState, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ArrowRight, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CountUp } from "@/components/ui/CountUp";

// ── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

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

// ── Env URLs ─────────────────────────────────────────────────────────────────
const KIWIFY_PROFISSIONAL = import.meta.env.VITE_KIWIFY_PROFISSIONAL_URL || "#";
const KIWIFY_VIDEOS_FFMPEG = import.meta.env.VITE_KIWIFY_ADDON_VIDEOS_FFMPEG_URL || "#";
const KIWIFY_VIDEOS_PREMIUM = import.meta.env.VITE_KIWIFY_ADDON_VIDEOS_PREMIUM_URL || "#";
const KIWIFY_WHATSAPP_PRO = import.meta.env.VITE_KIWIFY_ADDON_WHATSAPP_PRO_URL || "#";
const KIWIFY_SOCIAL_AUTOPILOT = import.meta.env.VITE_KIWIFY_ADDON_SOCIAL_AUTOPILOT_URL || "#";
const KIWIFY_PORTAIS_XML = import.meta.env.VITE_KIWIFY_ADDON_PORTAIS_XML_URL || "#";
const KIWIFY_BUNDLE = import.meta.env.VITE_KIWIFY_ADDON_BUNDLE_URL || "#";
const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20NexoImob";

// ── Features ─────────────────────────────────────────────────────────────────
const features = [
  "2 sites imobiliários",
  "CRM completo",
  "Funil de vendas",
  "Imóveis ilimitados",
  "Agendador de posts",
  "Roteiro de visitas",
  "Integrações portais",
  "Indicadores",
  "200 posts IA",
  "500.000 palavras IA",
  "Redecorar ambientes IA",
  "+59 funcionalidades",
  "Suporte VIP WhatsApp",
  "Customer Success",
  "Treinamento online",
  "Sem fidelidade",
];

// ── Add-ons ──────────────────────────────────────────────────────────────────
const addons = [
  { id: "videos",   icon: "🎬", name: "Vídeos com IA", price: "R$79/mês", desc: "Reels profissionais, Ken Burns, música", detail: "Crie vídeos automaticamente com IA", url: KIWIFY_VIDEOS_FFMPEG, bundle: false },
  { id: "videos",   icon: "✨", name: "Vídeos Premium", price: "R$19/vídeo", desc: "Cinematográficos profissionais", detail: "Qualidade cinematográfica sob demanda", url: KIWIFY_VIDEOS_PREMIUM, bundle: false },
  { id: "whatsapp", icon: "💬", name: "WhatsApp Pro", price: "R$49/mês", desc: "Inbox unificado, automações", detail: "Atenda todos os leads em um só lugar", url: KIWIFY_WHATSAPP_PRO, bundle: false },
  { id: "social",   icon: "📣", name: "Social Autopilot", price: "R$29/mês", desc: "Publicação automática IG+FB", detail: "Poste automaticamente nas redes sociais", url: KIWIFY_SOCIAL_AUTOPILOT, bundle: false },
  { id: "portais",  icon: "🏠", name: "Portais XML", price: "R$39/mês", desc: "Sincronize ZAP, OLX, VivaReal", detail: "Seus imóveis nos maiores portais", url: KIWIFY_PORTAIS_XML, bundle: false },
  { id: "bundle",   icon: "🎯", name: "Bundle Completo", price: "R$147/mês", desc: "Todos os módulos", detail: "Economize R$69", url: KIWIFY_BUNDLE, bundle: true },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqItems = [
  { q: "Posso cancelar a qualquer momento?", a: "Sim! Não há fidelidade. Cancele quando quiser diretamente pelo painel ou enviando um e-mail para nosso suporte. Seu acesso permanece ativo até o fim do período pago." },
  { q: "Os add-ons são obrigatórios?", a: "Não. Os add-ons são módulos extras opcionais que potencializam sua operação. O plano base já inclui tudo que você precisa para começar a vender mais." },
  { q: "Quais formas de pagamento são aceitas?", a: "Aceitamos cartão de crédito (até 12x), PIX e boleto bancário. O pagamento é processado pela Kiwify, plataforma segura e confiável." },
  { q: "O que acontece quando atinjo 200 posts IA?", a: "Ao atingir o limite mensal de 200 posts, você pode aguardar a renovação no próximo ciclo ou contratar créditos adicionais. O contador é resetado todo mês." },
  { q: "Como funcionam os vídeos com IA?", a: "O módulo de vídeos gera Reels e vídeos profissionais automaticamente usando IA. Basta selecionar o imóvel, escolher o estilo e a IA cria o vídeo com transições, música e textos." },
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
              🔒 Você precisa do add-on <strong>{missingModule}</strong> para acessar essa funcionalidade.
              Veja as opções abaixo.
            </p>
          </div>
        )}
        <Reveal>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold text-[#0A1628] leading-tight max-w-3xl mx-auto">
            Tudo que você precisa para vender mais imóveis
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto">
            Um plano completo. Sem surpresas. Cancele quando quiser.
          </motion.p>
        </Reveal>
      </section>

      {/* ── Plano Único ───────────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <Reveal className="flex justify-center">
          <motion.div variants={fadeUp} className="relative w-full max-w-[480px] border-2 border-[#0A1628] rounded-2xl p-8 bg-white shadow-lg">
            {/* Badge */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
              🔥 APROVEITAR OFERTA
            </span>

            <p className="text-center text-[#6B7280] text-sm mt-2">Plano Completo por menos de R$5 por dia</p>

            {/* Price */}
            <div className="text-center mt-6">
              <span className="text-5xl font-extrabold text-[#0A1628]">R$147</span>
              <span className="text-lg text-[#6B7280] ml-1">/mês</span>
            </div>

            {/* CTA */}
            <a
              href={KIWIFY_PROFISSIONAL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0A1628] hover:bg-[#162038] text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
            >
              Começar agora <ArrowRight size={18} />
            </a>

            <p className="text-center text-[#6B7280] text-xs mt-3">
              Corretor independente ou Imobiliárias em crescimento.
            </p>

            {/* Features Grid */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* ── Add-ons ───────────────────────────────────────────────────────── */}
      <section id="addons" className="pb-20 px-4 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto pt-16">
          <Reveal>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-[#0A1628] text-center mb-12">
              Potencialize com módulos extras
            </motion.h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon) => (
              <Reveal key={addon.name}>
                <motion.div
                  variants={fadeUp}
                  className={`relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col ${
                    addon.bundle ? "border-2 border-amber-400" : "border border-[#E5E7EB]"
                  } ${
                    missingModule && addon.id === missingModule
                      ? "ring-2 ring-[#FFD700] shadow-xl scale-[1.02] animate-pulse"
                      : ""
                  }`}
                >
                  {addon.bundle && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full">
                      Economize R$69
                    </span>
                  )}

                  <div className="text-3xl mb-3">{addon.icon}</div>
                  <h3 className="text-lg font-bold text-[#0A1628]">{addon.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{addon.desc}</p>
                  <p className="text-xl font-extrabold text-[#0A1628] mt-4">{addon.price}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{addon.detail}</p>

                  <div className="mt-auto pt-5">
                    <a
                      href={addon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors text-sm ${
                        addon.bundle
                          ? "bg-amber-400 hover:bg-amber-500 text-[#0A1628]"
                          : "bg-[#0A1628] hover:bg-[#162038] text-white"
                      }`}
                    >
                      Adicionar <Plus size={16} />
                    </a>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <CountUp end={3500} prefix="+" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">corretores</p>
          </div>
          <div>
            <CountUp end={40} prefix="+" suffix="h" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">economizadas/mês</p>
          </div>
          <div>
            <CountUp end={25} prefix="+" suffix="%" className="text-4xl font-extrabold text-[#0A1628]" />
            <p className="text-[#6B7280] text-sm mt-1">alcance digital</p>
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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Pronto para vender mais imóveis?
          </h2>
          <a
            href={KIWIFY_PROFISSIONAL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#0A1628] font-bold py-3.5 px-8 rounded-xl transition-colors text-base"
          >
            Começar agora por R$147/mês <ArrowRight size={18} />
          </a>
          <div className="mt-6">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <MessageCircle size={16} /> Falar com nosso time no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Garantia ──────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-full border border-emerald-200">
            ✅ 30 dias de garantia
          </span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
