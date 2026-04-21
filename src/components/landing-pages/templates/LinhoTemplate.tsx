/**
 * Template Linho — LP minimalista refinada.
 * Inspirado no modelo 06 (bege + verde natural, ícones line, layout amplo).
 */
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, Car, Phone, MessageCircle, Send,
  Home, Building2, Waves, Trees, Gem, Sun, Dumbbell, Wifi, Dog,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice, lpWhatsAppLink, getLPFotos, getLPHeadline, getLPDescricao, getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#4A5D3A"; // verde oliva escuro
const SECONDARY = "#8A7F6A"; // bege linho
const SURFACE = "#F5F0E8"; // bege muito claro

const AMENITY_ICONS: Record<string, typeof Home> = {
  piscina: Waves, lazer: Sun, academia: Dumbbell, wifi: Wifi,
  pet: Dog, area: Trees, varanda: Home, salao: Building2, alto: Gem,
};

function pickAmenityIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : Home;
}

export default function LinhoTemplate({ imovel, lp, corretor, isPreview }: LPTemplateProps) {
  const fotos = getLPFotos(imovel, lp);
  const headline = getLPHeadline(imovel, lp);
  const descricao = getLPDescricao(imovel, lp);
  const amenities = getLPAmenities(imovel, lp);

  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen w-full bg-white font-['Inter',sans-serif]">
      {/* Hero com imagem grande + logo minimalista no topo */}
      <section className="relative h-[520px] w-full overflow-hidden" style={{ backgroundColor: PRIMARY }}>
        {fotos[0] ? (
          <img src={fotos[0]} alt={headline} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)" }} />

        {/* Logo serif no topo */}
        <div className="absolute left-0 right-0 top-6 flex justify-center">
          <div
            className="rounded-sm px-6 py-2 text-center"
            style={{ backgroundColor: SURFACE, color: PRIMARY }}
          >
            <p className="font-serif text-xs uppercase tracking-[0.3em]">{corretor.nome}</p>
          </div>
        </div>

        {/* Title bottom-left */}
        <div className="absolute bottom-10 left-10 max-w-lg text-white">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4em] opacity-90">
            {lp.subheadline || "Lançamento"}
          </p>
          <h1 className="font-serif text-4xl font-light leading-tight drop-shadow md:text-5xl">
            {headline}
          </h1>
        </div>
      </section>

      {/* Intro centralizada */}
      <section className="w-full py-16" style={{ backgroundColor: SURFACE }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="font-serif text-base leading-relaxed md:text-lg" style={{ color: PRIMARY }}>
            {descricao ||
              `Descubra o melhor de ${imovel.cidade || "sua cidade"} em um empreendimento pensado para quem valoriza detalhes, conforto e sofisticação discreta.`}
          </p>
        </div>
      </section>

      {/* Grid de amenities com ícones line (signature) */}
      {amenities.length > 0 && (
        <section className="w-full px-4 py-16" style={{ backgroundColor: SURFACE }}>
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {amenities.slice(0, 15).map((a) => {
                const Icon = pickAmenityIcon(a);
                return (
                  <div
                    key={a}
                    className="flex flex-col items-center gap-2 rounded-sm bg-white p-5 text-center shadow-sm"
                  >
                    <Icon className="h-6 w-6" style={{ color: PRIMARY }} strokeWidth={1.25} />
                    <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: PRIMARY }}>
                      {a}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Card 2 colunas: imagem + descrição */}
      <section className="w-full px-4 py-20 bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: SECONDARY }}>
              Sobre o empreendimento
            </p>
            <h2 className="mb-4 font-serif text-3xl font-light leading-tight" style={{ color: PRIMARY }}>
              Um novo modo de viver
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              {descricao ||
                "Projeto contemporâneo com design arquitetônico refinado, sustentabilidade e lazer completo integrados com equilíbrio."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              {imovel.area_total && (
                <div className="border-l-2 pl-3" style={{ borderColor: PRIMARY }}>
                  <p className="text-gray-400 uppercase tracking-wider">Área</p>
                  <p className="font-bold" style={{ color: PRIMARY }}>{imovel.area_total} m²</p>
                </div>
              )}
              {imovel.quartos > 0 && (
                <div className="border-l-2 pl-3" style={{ borderColor: PRIMARY }}>
                  <p className="text-gray-400 uppercase tracking-wider">Quartos</p>
                  <p className="font-bold" style={{ color: PRIMARY }}>{imovel.quartos}</p>
                </div>
              )}
              {imovel.vagas > 0 && (
                <div className="border-l-2 pl-3" style={{ borderColor: PRIMARY }}>
                  <p className="text-gray-400 uppercase tracking-wider">Vagas</p>
                  <p className="font-bold" style={{ color: PRIMARY }}>{imovel.vagas}</p>
                </div>
              )}
              {imovel.preco && (
                <div className="border-l-2 pl-3" style={{ borderColor: PRIMARY }}>
                  <p className="text-gray-400 uppercase tracking-wider">A partir de</p>
                  <p className="font-bold" style={{ color: PRIMARY }}>{formatLPPrice(imovel.preco)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="order-1 overflow-hidden rounded-sm md:order-2">
            {fotos[1] ? (
              <img src={fotos[1]} alt="" className="h-80 w-full object-cover" />
            ) : (
              <div className="h-80 w-full" style={{ backgroundColor: SECONDARY }} />
            )}
          </div>
        </div>
      </section>

      {/* Vídeo embed (opcional) */}
      {imovel.video_url && (
        <section className="w-full px-4 py-16" style={{ backgroundColor: SURFACE }}>
          <div className="mx-auto max-w-4xl">
            <div className="aspect-video overflow-hidden rounded-sm">
              <iframe
                src={imovel.video_url.replace("watch?v=", "embed/")}
                title="Vídeo"
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Form final minimalista */}
      <section className="w-full px-4 py-20 bg-white">
        <div className="mx-auto max-w-xl">
          <div className="rounded-sm border p-8" style={{ borderColor: PRIMARY }}>
            <h3 className="mb-2 text-center font-serif text-2xl font-light" style={{ color: PRIMARY }}>
              Interessado?
            </h3>
            <p className="mb-6 text-center text-xs text-gray-500">
              Receba mais informações sobre o empreendimento
            </p>
            {sent ? (
              <p className="rounded-sm py-3 text-center text-sm text-white" style={{ backgroundColor: PRIMARY }}>
                Mensagem enviada!
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-2 text-sm outline-none transition focus:border-b-2"
                  style={{ borderColor: PRIMARY }}
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-2 text-sm outline-none transition focus:border-b-2"
                  style={{ borderColor: PRIMARY }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-2 text-sm outline-none transition focus:border-b-2"
                  style={{ borderColor: PRIMARY }}
                />
                <button
                  type="submit"
                  className="mt-5 flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Send className="h-4 w-4" /> Enviar
                </button>
              </form>
            )}

            {corretor.whatsapp && (
              <a
                href={lpWhatsAppLink(corretor.whatsapp, headline)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-sm border py-3 text-xs font-semibold uppercase tracking-[0.3em] transition hover:text-white"
                style={{ borderColor: PRIMARY, color: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="w-full py-8 text-center" style={{ backgroundColor: PRIMARY, color: SURFACE }}>
        <p className="font-serif text-sm">{corretor.nome}</p>
        {corretor.creci && <p className="mt-1 text-[10px] uppercase tracking-[0.3em] opacity-70">CRECI {corretor.creci}</p>}
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] opacity-60">
          NexoImob AI • © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
