/**
 * Template Sálvia — LP contemporânea natural.
 * Inspirado no modelo 07 (verde sálvia + branco, imagens com bordas arredondadas, vídeo centralizado).
 */
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, Car, Phone, MessageCircle, Send, Play, Leaf,
  Home, Waves, Trees, Sun, Dumbbell, Wifi, Dog, Gem,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice, lpWhatsAppLink, getLPFotos, getLPHeadline, getLPDescricao, getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#8FA68E"; // sálvia
const DARK = "#3D5243"; // verde escuro
const SURFACE = "#F8F6F1"; // off-white quente

const AMENITY_ICONS: Record<string, typeof Home> = {
  piscina: Waves, natureza: Leaf, academia: Dumbbell, wifi: Wifi,
  pet: Dog, area: Trees, sol: Sun, alto: Gem,
};

function pickIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : Home;
}

export default function SalviaTemplate({ imovel, lp, corretor, isPreview }: LPTemplateProps) {
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
    <div className="min-h-screen w-full font-['Inter',sans-serif]" style={{ backgroundColor: SURFACE }}>
      {/* Header mini centralizado */}
      <div className="mx-auto max-w-md px-4 py-8 text-center">
        <Leaf className="mx-auto mb-3 h-6 w-6" style={{ color: PRIMARY }} />
        <p className="font-serif text-sm italic" style={{ color: DARK }}>
          {corretor.nome}
        </p>
      </div>

      {/* Intro text banner verde */}
      <section className="mx-auto max-w-3xl px-6 pb-10 text-center">
        <div
          className="rounded-full px-8 py-4"
          style={{ backgroundColor: PRIMARY, color: "white" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            {lp.subheadline || "Lançamento exclusivo"}
          </p>
        </div>
      </section>

      {/* Hero com imagem em borda arredondada (signature) */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-[32px] shadow-lg">
          {fotos[0] ? (
            <img src={fotos[0]} alt={headline} className="h-[420px] w-full object-cover" />
          ) : (
            <div
              className="h-[420px] w-full"
              style={{ background: `linear-gradient(135deg, ${DARK} 0%, ${PRIMARY} 100%)` }}
            />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(61,82,67,0.7) 100%)" }} />
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="font-serif text-4xl font-light leading-tight drop-shadow md:text-5xl">
              {headline}
            </h1>
          </div>
        </div>
      </section>

      {/* Descrição */}
      <section className="mx-auto max-w-3xl px-6 py-8 text-center">
        <p className="text-base leading-relaxed md:text-lg" style={{ color: DARK }}>
          {descricao ||
            `Um refúgio contemporâneo em ${imovel.cidade || "sua cidade"}, onde arquitetura, natureza e bem-estar se encontram.`}
        </p>
      </section>

      {/* Amenities em grid cinza-claro */}
      {amenities.length > 0 && (
        <section className="w-full px-4 py-12">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white/60 p-8 shadow-sm">
            <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
              {amenities.slice(0, 15).map((a) => {
                const Icon = pickIcon(a);
                return (
                  <div key={a} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${PRIMARY}25` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: DARK }} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: DARK }}>
                      {a}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Banda verde sálvia com imagem (signature) */}
      <section className="w-full py-16" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2 md:items-center">
          <div className="text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] opacity-90">
              Sobre o empreendimento
            </p>
            <h2 className="mb-4 font-serif text-3xl font-light leading-tight">
              Viva com serenidade
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-white/90">
              {descricao
                ? descricao.length > 200
                  ? `${descricao.slice(0, 200)}...`
                  : descricao
                : "Projeto que privilegia áreas verdes, iluminação natural e conexão com o ambiente. Cada detalhe pensado para sua qualidade de vida."}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {imovel.area_total && (
                <div>
                  <p className="text-white/70 uppercase tracking-wider">Área</p>
                  <p className="text-lg font-bold">{imovel.area_total} m²</p>
                </div>
              )}
              {imovel.quartos > 0 && (
                <div>
                  <p className="text-white/70 uppercase tracking-wider">Quartos</p>
                  <p className="text-lg font-bold">{imovel.quartos}</p>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px]">
            {fotos[1] ? (
              <img src={fotos[1]} alt="" className="h-64 w-full object-cover md:h-80" />
            ) : (
              <div className="h-64 w-full bg-white/20 md:h-80" />
            )}
          </div>
        </div>
      </section>

      {/* Vídeo centralizado com botão play over imagem */}
      {imovel.video_url && (
        <section className="mx-auto max-w-4xl px-4 py-16">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: PRIMARY }}>
            <Play className="mr-1 inline-block h-3 w-3" /> Conheça o imóvel
          </p>
          <div className="aspect-video overflow-hidden rounded-[24px] shadow-lg">
            <iframe
              src={imovel.video_url.replace("watch?v=", "embed/")}
              title="Vídeo"
              className="h-full w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Preço destacado */}
      {imovel.preco && (
        <section className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: PRIMARY }}>
            {imovel.finalidade === "aluguel" ? "aluguel a partir de" : "unidades a partir de"}
          </p>
          <p className="mt-2 font-serif text-5xl font-light" style={{ color: DARK }}>
            {formatLPPrice(imovel.preco)}
          </p>
        </section>
      )}

      {/* Form sobre hero image secundária */}
      <section
        className="relative w-full px-4 py-20"
        style={{
          backgroundImage: fotos[2] ? `url(${fotos[2]})` : undefined,
          backgroundColor: DARK,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: `${DARK}CC` }} />
        <div className="relative mx-auto max-w-md">
          <div className="rounded-[24px] bg-white/95 p-8 backdrop-blur">
            <h3 className="mb-2 text-center font-serif text-2xl font-light" style={{ color: DARK }}>
              Quero saber mais
            </h3>
            <p className="mb-6 text-center text-xs text-gray-500">
              Entre em contato e receba o material completo do empreendimento
            </p>
            {sent ? (
              <p className="rounded-full py-3 text-center text-sm text-white" style={{ backgroundColor: PRIMARY }}>
                Recebido, em breve retornaremos!
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110"
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
                className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold"
                style={{ color: DARK }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Prefere WhatsApp? {corretor.whatsapp}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center" style={{ backgroundColor: DARK, color: "white" }}>
        <Leaf className="mx-auto mb-2 h-5 w-5 opacity-60" />
        <p className="font-serif text-sm">{corretor.nome}</p>
        {corretor.creci && <p className="mt-1 text-[10px] uppercase tracking-[0.3em] opacity-60">CRECI {corretor.creci}</p>}
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] opacity-50">NexoImob AI</p>
      </footer>
    </div>
  );
}
