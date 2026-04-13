import { useState, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Plus, Minus, Sparkles, Zap, Download,
  Instagram, Clock, Shield, Star, TrendingUp, Layers, Palette, Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { KIWIFY_CHECKOUT_CRIATIVOS as CHECKOUT } from "@/lib/kiwify-links";

// ─── Motion primitives ──────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-[#0A1628] font-semibold text-[15px] group-hover:text-[#002B5B] transition-colors">
          {q}
        </span>
        <span className="shrink-0 text-[#6B7280] group-hover:text-[#002B5B] transition-colors">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#6B7280] text-sm leading-relaxed max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mockup do dashboard gerando criativo (puro CSS/SVG) ──────────
function HeroMockup() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      {/* Glow de fundo */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-[#FFD700]/20 via-[#002B5B]/10 to-transparent rounded-[40px] blur-2xl" />

      {/* Card principal — simula janela do dashboard */}
      <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,43,91,0.25)] border border-[#E5E7EB] overflow-hidden">
        {/* Toolbar da janela */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-[#F8FAFF]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="ml-3 text-[10px] font-mono text-[#6B7280]">nexoimobai.com.br/dashboard/criativos</div>
        </div>

        {/* Conteúdo simulado */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#002B5B] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
            </div>
            <div className="flex-1">
              <div className="h-2.5 bg-[#E5E7EB] rounded w-24 mb-1" />
              <div className="h-2 bg-[#F1F5F9] rounded w-16" />
            </div>
            <div className="text-[10px] font-bold px-2 py-1 rounded bg-[#DCFCE7] text-[#166534]">
              ✨ GERANDO
            </div>
          </div>

          {/* Grid de criativos simulados */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { bg: "from-[#002B5B] to-[#001D3D]", icon: "🏠" },
              { bg: "from-[#1E3A8A] to-[#1E40AF]", icon: "🏢" },
              { bg: "from-[#0F172A] to-[#1E293B]", icon: "🌆" },
              { bg: "from-[#FFD700] to-[#E6C200]", icon: "🏡" },
              { bg: "from-[#059669] to-[#047857]", icon: "🏘️" },
              { bg: "from-[#7C2D12] to-[#92400E]", icon: "🏰" },
            ].map((item, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg bg-gradient-to-br ${item.bg} flex items-center justify-center text-2xl shadow-inner relative overflow-hidden`}
              >
                <span className="relative z-10">{item.icon}</span>
                <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/30 rounded" />
              </div>
            ))}
          </div>

          {/* Barra de progresso */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#002B5B] to-[#FFD700]"
                initial={{ width: "10%" }}
                animate={{ width: "92%" }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#6B7280]">92%</span>
          </div>
        </div>
      </div>

      {/* Floating badge — tempo */}
      <motion.div
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-3 flex items-center gap-2"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center">
          <Zap className="w-4 h-4 text-[#002B5B]" />
        </div>
        <div>
          <div className="text-[10px] text-[#6B7280] font-medium">Gerado em</div>
          <div className="text-sm font-extrabold text-[#0A1628]">30 seg</div>
        </div>
      </motion.div>

      {/* Floating badge — criativos gerados */}
      <motion.div
        className="absolute -bottom-3 -left-4 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-3 flex items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-9 h-9 rounded-xl bg-[#002B5B] flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#FFD700]" />
        </div>
        <div>
          <div className="text-[10px] text-[#6B7280] font-medium">Este mês</div>
          <div className="text-sm font-extrabold text-[#0A1628]">+50 artes</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Mockup mini para a seção "Como funciona" ─────────────────────
function StepMockup({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    // Upload
    return (
      <div className="relative bg-white rounded-xl border-2 border-dashed border-[#CBD5E1] p-6 h-36 flex flex-col items-center justify-center">
        <ImageIcon className="w-8 h-8 text-[#94A3B8] mb-2" />
        <div className="h-1.5 w-24 bg-[#E5E7EB] rounded mb-1" />
        <div className="h-1.5 w-16 bg-[#F1F5F9] rounded" />
      </div>
    );
  }
  if (step === 2) {
    // AI generating
    return (
      <div className="relative bg-gradient-to-br from-[#002B5B] to-[#001D3D] rounded-xl p-6 h-36 flex flex-col items-center justify-center">
        <motion.div
          className="w-10 h-10 rounded-xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center mb-3"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-5 h-5 text-[#FFD700]" />
        </motion.div>
        <div className="h-1.5 w-24 bg-white/20 rounded mb-1" />
        <div className="h-1.5 w-16 bg-white/10 rounded" />
      </div>
    );
  }
  // Download / publish
  return (
    <div className="relative bg-white rounded-xl border border-[#E5E7EB] p-4 h-36 flex items-center justify-center gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#002B5B] to-[#001D3D]" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFF] border border-[#E5E7EB]">
          <Download className="w-3 h-3 text-[#002B5B]" />
          <span className="text-[10px] font-semibold text-[#0A1628]">Baixar</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]">
          <Instagram className="w-3 h-3 text-white" />
          <span className="text-[10px] font-semibold text-white">Publicar</span>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery preview — placeholder visual bonito ──────────────────
function GalleryCard({ gradient, label }: { gradient: string; label: string }) {
  return (
    <motion.div
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* Conteúdo fake do criativo */}
      <div className="absolute top-4 left-4 right-4">
        <div className="h-1.5 w-20 bg-white/40 rounded mb-1" />
        <div className="h-2 w-28 bg-white/60 rounded" />
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-white/90 rounded" />
          <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center shrink-0">
            <ArrowRight className="w-3 h-3 text-[#002B5B]" />
          </div>
        </div>
      </div>
      {/* Hover border */}
      <div className="absolute inset-0 ring-2 ring-[#FFD700] opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
    </motion.div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────

const STATS = [
  { value: "50k+", label: "Criativos gerados" },
  { value: "2.500+", label: "Corretores ativos" },
  { value: "30s", label: "Tempo médio de geração" },
  { value: "95%", label: "Satisfação dos clientes" },
];

const PARTNER_LOGOS = [
  "Imobiliária Alpha", "Prime Imóveis", "Central Broker", "Casa Verde",
  "Top House", "Viva Real Group", "Maxim Imóveis", "Norte Sul",
];

const STEPS = [
  {
    n: "01",
    title: "Envie a foto do imóvel",
    desc: "Arraste a imagem do seu computador ou cole a URL. Aceita JPG, PNG e WebP — qualquer resolução.",
    step: 1 as const,
  },
  {
    n: "02",
    title: "A IA monta o criativo",
    desc: "Cores da sua marca, copy gerada automaticamente, template escolhido por você. Tudo em 30 segundos.",
    step: 2 as const,
  },
  {
    n: "03",
    title: "Baixe ou publique direto",
    desc: "Download em alta resolução, compartilhamento por WhatsApp ou publicação direta no Instagram.",
    step: 3 as const,
  },
];

const GALLERY = [
  { gradient: "from-[#002B5B] via-[#001D3D] to-[#0A1628]", label: "Dark Premium" },
  { gradient: "from-[#3B82F6] via-[#2563EB] to-[#1E40AF]", label: "IA Express" },
  { gradient: "from-[#059669] via-[#047857] to-[#064E3B]", label: "Imobiliário Top" },
  { gradient: "from-[#92400E] via-[#7C2D12] to-[#451A03]", label: "Clássico Elegante" },
  { gradient: "from-[#0A1628] via-[#030712] to-[#000000]", label: "Black Gold Tower" },
  { gradient: "from-[#DC2626] via-[#B91C1C] to-[#7F1D1D]", label: "Captação Express" },
  { gradient: "from-[#7C3AED] via-[#6D28D9] to-[#4C1D95]", label: "Urban Luxury" },
  { gradient: "from-[#0891B2] via-[#0E7490] to-[#164E63]", label: "Modern Coastal" },
];

const STYLES = [
  { name: "Dark Premium", desc: "Navy + dourado, alto padrão", gradient: "from-[#002B5B] to-[#001D3D]", tag: "Mais usado" },
  { name: "IA Express", desc: "Azul vibrante, rápido", gradient: "from-[#3B82F6] to-[#1E40AF]" },
  { name: "Imobiliário Top", desc: "Verde corporativo clássico", gradient: "from-[#059669] to-[#064E3B]" },
  { name: "Clássico Elegante", desc: "Terracota + serif", gradient: "from-[#92400E] to-[#451A03]" },
  { name: "Black Gold Tower", desc: "Preto profundo + dourado", gradient: "from-[#0A1628] to-[#000000]", tag: "Novo" },
  { name: "Captação Express", desc: "Vermelho impactante", gradient: "from-[#DC2626] to-[#7F1D1D]" },
];

const PERSONAS = [
  {
    emoji: "👤",
    title: "Corretor solo",
    desc: "Pare de depender de designer. Gere seus próprios posts em segundos, com a cara da sua marca.",
    features: ["Sem curva de aprendizado", "Funciona no celular", "Export direto pro WhatsApp"],
  },
  {
    emoji: "🏢",
    title: "Imobiliária",
    desc: "Padronize a identidade visual do time inteiro. Templates compartilhados, cores fixas, logo automática.",
    features: ["Multi-usuário", "Templates da empresa", "Histórico completo"],
  },
  {
    emoji: "📱",
    title: "Social Media imobiliário",
    desc: "Entregue conteúdo em escala. Atenda múltiplos clientes com templates diferenciados por marca.",
    features: ["Troca rápida de cliente", "Bulk export", "Agendamento IG"],
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "R$97",
    desc: "Pra começar a testar",
    features: ["50 criativos/mês", "Feed + Story", "3 estilos visuais", "Download em HD", "Suporte em horário comercial"],
    url: CHECKOUT.starter,
  },
  {
    name: "Básico",
    price: "R$197",
    desc: "O mais escolhido",
    features: [
      "100 criativos/mês",
      "Feed + Story + Reel",
      "6 estilos visuais completos",
      "Publicação direta IG + FB",
      "Marca d'água personalizada",
      "Suporte prioritário",
    ],
    url: CHECKOUT.basico,
    highlighted: true,
    badge: "Mais popular",
  },
  {
    name: "PRO",
    price: "R$397",
    desc: "Pra quem vive do digital",
    features: [
      "150 criativos/mês",
      "Todos os formatos + carrosséis",
      "Todos os estilos + temas exclusivos",
      "Publicação IG + FB + LinkedIn",
      "Brand kit da empresa",
      "Suporte 24/7 + consultoria",
    ],
    url: CHECKOUT.pro,
  },
];

const TESTIMONIALS = [
  {
    name: "Rafael Medeiros",
    role: "Corretor autônomo — Salvador/BA",
    text: "Eu perdia 2 horas por dia no Canva. Hoje gero 10 posts antes do café da manhã. Meu engajamento no Instagram dobrou em 3 meses.",
    stars: 5,
  },
  {
    name: "Ana Luiza Souza",
    role: "Imobiliária Prime — Recife/PE",
    text: "Padronizamos a identidade do time de 8 corretores. Cada um posta no estilo da casa, sem precisar de designer. Economia brutal.",
    stars: 5,
  },
  {
    name: "Diego Almeida",
    role: "Social Media imobiliário — São Paulo/SP",
    text: "Atendo 5 imobiliárias diferentes. O NexoImob me deixa trocar de marca em um clique. Triplicou minha capacidade de entrega.",
    stars: 5,
  },
];

const FAQ = [
  { q: "Preciso saber editar ou usar Canva?", a: "Não. Você envia a foto, escolhe o estilo e a IA monta o criativo completo em 30 segundos. Zero curva de aprendizado." },
  { q: "Funciona para qual tipo de imóvel?", a: "Todos — apartamentos, casas, terrenos, salas comerciais, galpões, chácaras, fazendas. Os templates se adaptam automaticamente ao tipo." },
  { q: "Posso usar minha própria logo e cores?", a: "Sim. No plano Básico e PRO você configura uma vez sua marca (logo, cores, fonte) e todos os criativos seguem o padrão automaticamente." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele a qualquer momento direto no painel. Nenhuma taxa de cancelamento." },
  { q: "Tem período de teste grátis?", a: "7 dias de garantia incondicional. Não gostou, devolvemos 100% do valor. Sem perguntas." },
  { q: "Os criativos ficam com marca d'água?", a: "Não. Os criativos são 100% seus, em alta resolução, sem qualquer marca do NexoImob." },
  { q: "Posso publicar direto no Instagram?", a: "Sim, nos planos Básico e PRO. Conecte sua conta Instagram/Facebook uma vez e publique com 1 clique direto do painel." },
  { q: "Funciona no celular?", a: "Sim. Toda a plataforma é responsiva. Você pode gerar, baixar e publicar criativos direto do celular." },
];

// ─── PÁGINA ───────────────────────────────────────────────────────
export default function CriativosPage() {
  return (
    <div className="min-h-screen bg-white text-[#374151]">
      <Header />

      {/* ═══════ HERO ═══════ */}
      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F1F5FC] via-[#F8FAFF] to-white relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,43,91,0.06),transparent_50%)]" />

        <div className="container mx-auto px-6 relative">
          <Reveal className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Copy */}
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">
                <Sparkles size={13} />
                IA para Criativos Imobiliários
              </div>

              <h1
                className="text-[clamp(2.25rem,5vw,3.5rem)] font-rubik font-extrabold text-[#0A1628] leading-[1.05] tracking-tight"
                             >
                Posts de imóveis com{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">IA em 30 segundos</span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-[#FFD700]/40 -z-0" />
                </span>
              </h1>

              <p className="text-[#6B7280] text-base md:text-lg leading-relaxed max-w-xl">
                Templates exclusivos para corretor, com a cara da sua marca. Sem designer, sem Canva, sem demora.
                Gere 50 criativos por mês e publique direto no Instagram.
              </p>

              {/* Checks */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#374151]">
                {["50 artes por mês", "6 estilos profissionais", "Publicação automática"].map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <Check size={16} className="text-[#059669]" strokeWidth={3} />
                    {s}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-2">
                <a
                  href="#planos"
                  className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-7 py-4 rounded-[12px] transition-all hover:shadow-lg hover:shadow-[#002B5B]/20"
                >
                  Começar agora <ArrowRight size={16} />
                </a>
                <a
                  href="#exemplos"
                  className="inline-flex items-center gap-2 bg-white border-[1.5px] border-[#CBD5E1] hover:border-[#002B5B] text-[#002B5B] font-bold text-sm px-7 py-4 rounded-[12px] transition-all"
                >
                  Ver exemplos
                </a>
              </div>

              {/* Prova social */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#002B5B]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#3B82F6]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#059669]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#DC2626]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FFD700]" />
                </div>
                <div className="text-xs text-[#6B7280]">
                  <span className="font-bold text-[#0A1628]">+2.500 corretores</span> usando agora
                </div>
              </div>
            </motion.div>

            {/* Mockup */}
            <motion.div variants={fadeUp} className="flex items-center justify-center">
              <HeroMockup />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ BARRA DE LOGOS ═══════ */}
      <section className="border-y border-[#E5E7EB] bg-white py-10">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-[#6B7280] font-semibold mb-6">
            Usado por corretores e imobiliárias de todo o Brasil
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {PARTNER_LOGOS.map((name) => (
              <div
                key={name}
                className="text-sm font-bold text-[#94A3B8] tracking-tight whitespace-nowrap"
                             >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMO FUNCIONA ═══════ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F8FAFF] border border-[#C7D7F5] text-[#002B5B] mb-4">
              PROCESSO SIMPLES
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Do celular ao Instagram em <span className="text-[#002B5B]">3 passos</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              Sem plugins, sem instalação, sem aprendizado. Abra o navegador e comece.
            </motion.p>
          </Reveal>

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 hover:border-[#002B5B] hover:shadow-[0_8px_30px_rgba(0,43,91,0.08)] transition-all relative overflow-hidden"
              >
                <div className="absolute top-4 right-5 text-6xl font-extrabold text-[#F1F5F9] leading-none select-none" >
                  {s.n}
                </div>
                <div className="relative">
                  <StepMockup step={s.step} />
                  <h3 className="text-[#0A1628] font-bold text-lg mt-5 mb-2" >
                    {s.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ GALERIA DE EXEMPLOS ═══════ */}
      <section id="exemplos" className="py-20 px-6 bg-[#F8FAFF] scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] mb-4">
              <Palette size={13} />
              GALERIA
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Veja criativos gerados por <span className="text-[#002B5B]">corretores reais</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              8 exemplos dos mais de 50 mil criativos já criados no NexoImob.
            </motion.p>
          </Reveal>

          <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY.map((g) => (
              <motion.div key={g.label} variants={fadeUp}>
                <GalleryCard gradient={g.gradient} label={g.label} />
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,215,0,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-6xl relative">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-[clamp(2.5rem,5vw,4rem)] font-rubik font-extrabold text-[#FFD700] leading-none mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-white/80 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ ESTILOS ═══════ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F8FAFF] border border-[#C7D7F5] text-[#002B5B] mb-4">
              <Layers size={13} />
              ESTILOS VISUAIS
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              6 estilos profissionais <span className="text-[#002B5B]">prontos para usar</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              Cada estilo foi desenhado especificamente para corretor, por designers com experiência em mercado imobiliário.
            </motion.p>
          </Reveal>

          <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {STYLES.map((s) => (
              <motion.div
                key={s.name}
                variants={fadeUp}
                className="group bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-5 hover:border-[#002B5B] hover:shadow-[0_8px_30px_rgba(0,43,91,0.08)] transition-all"
              >
                {/* Mini preview do estilo */}
                <div className={`aspect-video rounded-xl bg-gradient-to-br ${s.gradient} mb-4 relative overflow-hidden`}>
                  <div className="absolute top-3 left-3 h-1.5 w-12 bg-white/40 rounded" />
                  <div className="absolute top-5 left-3 h-2 w-20 bg-white/70 rounded" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="h-2 w-16 bg-[#FFD700] rounded" />
                    <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40" />
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[#0A1628] font-bold text-sm mb-1" >
                      {s.name}
                    </h3>
                    <p className="text-[#6B7280] text-xs">{s.desc}</p>
                  </div>
                  {s.tag && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                      {s.tag}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ PARA QUEM ═══════ */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Feito para profissionais do <span className="text-[#002B5B]">mercado imobiliário</span>
            </motion.h2>
          </Reveal>

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONAS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 hover:border-[#002B5B] transition-all"
              >
                <div className="text-4xl mb-3">{p.emoji}</div>
                <h3 className="text-[#0A1628] font-bold text-lg mb-2" >
                  {p.title}
                </h3>
                <p className="text-[#6B7280] text-sm mb-4 leading-relaxed">{p.desc}</p>
                <ul className="space-y-2 border-t border-[#E5E7EB] pt-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[#374151]">
                      <Check size={13} className="text-[#059669] shrink-0 mt-0.5" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ DEPOIMENTOS ═══════ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Quem usa, não volta <span className="text-[#002B5B]">pro Canva</span>
            </motion.h2>
          </Reveal>

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-[#F8FAFF] rounded-2xl border border-[#E5E7EB] p-7 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-[#FFD700] text-[#FFD700]" />
                  ))}
                </div>
                <p className="text-[#374151] text-sm leading-relaxed mb-5 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-[#E5E7EB] pt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002B5B] to-[#1E3A8A] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-[#0A1628] font-bold text-sm">{t.name}</div>
                    <div className="text-[#6B7280] text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════ PLANOS ═══════ */}
      <section id="planos" className="py-20 px-6 bg-[#F8FAFF] scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] mb-4">
              <Shield size={13} />
              7 DIAS DE GARANTIA
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Escolha o plano ideal
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              Todos com 7 dias de garantia incondicional. Cancele quando quiser, sem fidelidade.
            </motion.p>
          </Reveal>

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                className={`bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all relative ${
                  p.highlighted
                    ? "border-2 border-[#002B5B] shadow-[0_12px_40px_rgba(0,43,91,0.15)] lg:scale-[1.03]"
                    : "border-[1.5px] border-[#E5E7EB] hover:border-[#002B5B]"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full bg-[#002B5B] text-white shadow-lg">
                    ⭐ {p.badge}
                  </span>
                )}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{p.name}</span>
                  <div className="text-4xl font-rubik font-extrabold text-[#0A1628] mt-2">
                    {p.price}
                    <span className="text-sm font-medium text-[#6B7280]">/mês</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{p.desc}</p>
                </div>
                <div className="h-px bg-[#E5E7EB]" />
                <ul className="flex flex-col gap-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                      <Check size={15} className="text-[#059669] shrink-0 mt-0.5" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => window.open(p.url, "_blank")}
                  className={`w-full py-3.5 rounded-[10px] font-bold text-sm transition-all ${
                    p.highlighted
                      ? "bg-[#002B5B] hover:bg-[#001d3d] text-white shadow-lg shadow-[#002B5B]/20"
                      : "bg-white hover:bg-[#F8FAFF] text-[#002B5B] border-[1.5px] border-[#CBD5E1] hover:border-[#002B5B]"
                  }`}
                >
                  Assinar {p.name}
                </button>
              </motion.div>
            ))}
          </Reveal>

          <div className="text-center mt-10">
            <Link to="/precos" className="text-[#002B5B] font-semibold text-sm hover:underline inline-flex items-center gap-1">
              Comparar todos os planos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-3xl">
          <Reveal className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-rubik font-extrabold text-[#0A1628] mb-3">
              Dúvidas frequentes
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              Não achou sua resposta?{" "}
              <Link to="/contato" className="text-[#002B5B] font-semibold hover:underline">
                Fale com a gente
              </Link>
            </motion.p>
          </Reveal>
          <div>
            {FAQ.map((f) => (
              <Accordion key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#002B5B] via-[#001D3D] to-[#0A1628] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,rgba(255,215,0,0.8)_1px,transparent_1px)] bg-[length:32px_32px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] mb-5">
              <Clock size={13} />
              COMECE EM 2 MINUTOS
            </div>
            <h2 className="text-3xl md:text-5xl font-rubik font-extrabold text-white leading-[1.1] mb-5">
              Pronto para criar{" "}
              <span className="text-[#FFD700]">50 artes profissionais</span>
              <br className="hidden md:inline" /> por mês?
            </h2>
            <p className="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Teste 7 dias. Se não amar, devolvemos 100%. Sem letras miúdas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#planos"
                className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-8 py-4 rounded-[12px] transition-all shadow-lg shadow-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30"
              >
                Escolher meu plano <ArrowRight size={16} />
              </a>
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 bg-transparent border-[1.5px] border-white/30 hover:border-white/60 text-white font-bold text-sm px-8 py-4 rounded-[12px] transition-all"
              >
                Falar com consultor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
