/**
 * Template Lar — LP familiar warm.
 * Inspirado no modelo 09 (tan + dourado warm, frase acolhedora repetida, form dourado).
 */
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, Car, MessageCircle, Send, Play, Heart,
  Home, Waves, Trees, Sun, Dumbbell, Wifi, Dog, Baby, Flower2,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice, lpWhatsAppLink, getLPFotos, getLPHeadline, getLPDescricao, getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#8A7150"; // tan médio
const ACCENT = "#D4B483"; // dourado warm
const SOFT = "#F5EDE0"; // bege claro
const DARK = "#3D3020"; // marrom escuro

const AMENITY_ICONS: Record<string, typeof Home> = {
  piscina: Waves, natureza: Flower2, academia: Dumbbell, wifi: Wifi,
  pet: Dog, area: Trees, sol: Sun, crianca: Baby, familia: Heart,
};

function pickIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : Home;
}

export default function LarTemplate({ imovel, lp, corretor, isPreview, onSubmitLead }: LPTemplateProps) {
  const fotos = getLPFotos(imovel, lp);
  const headline = getLPHeadline(imovel, lp);
  const descricao = getLPDescricao(imovel, lp);
  const amenities = getLPAmenities(imovel, lp);

  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [sent, setSent] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || !onSubmitLead) {
      setSent(true);
      return;
    }
    setSending(true);
    setSendErr(null);
    const r = await onSubmitLead({
      nome: form.nome,
      email: form.email || undefined,
      telefone: form.telefone,
    });
    setSending(false);
    if (r.success) setSent(true);
    else setSendErr(r.error || "Falha ao enviar.");
  };

  const frase = lp.subheadline || "Aqui você encontra o melhor imóvel para a sua família";

  return (
    <div className="min-h-screen w-full font-['Inter',sans-serif]" style={{ backgroundColor: SOFT }}>
      {/* Logo mini no topo */}
      <div className="mx-auto max-w-sm px-4 py-6 text-center">
        <Home className="mx-auto mb-2 h-6 w-6" style={{ color: PRIMARY }} />
        <p className="font-serif text-xs uppercase tracking-[0.3em]" style={{ color: PRIMARY }}>
          {corretor.nome}
        </p>
      </div>

      {/* Hero 1 — imagem grande com frase serifada sobreposta */}
      <section className="relative h-[420px] w-full overflow-hidden md:h-[520px]">
        {fotos[0] ? (
          <img src={fotos[0]} alt={headline} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)" }} />

        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-10 text-white">
          <div className="max-w-lg">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
              {lp.subheadline ? "Lançamento" : "Seu novo lar"}
            </p>
            <h1 className="font-serif text-4xl font-light uppercase leading-tight drop-shadow md:text-5xl">
              {frase}
            </h1>
          </div>
        </div>
      </section>

      {/* Card cinza com amenities 15 ícones line (signature) */}
      {amenities.length > 0 && (
        <section className="w-full px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-xl bg-white/70 p-8 shadow-sm backdrop-blur">
              <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: PRIMARY }}>
                Diferenciais do empreendimento
              </p>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                {amenities.slice(0, 15).map((a) => {
                  const Icon = pickIcon(a);
                  return (
                    <div key={a} className="flex flex-col items-center gap-2 text-center">
                      <Icon className="h-6 w-6" style={{ color: PRIMARY }} strokeWidth={1.25} />
                      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: DARK }}>
                        {a}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2 colunas: descrição + imagem */}
      <section className="w-full px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Sobre
            </p>
            <h2 className="mb-4 font-serif text-3xl font-light leading-tight" style={{ color: DARK }}>
              {headline}
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {descricao ||
                `Um lugar pensado para receber sua família com conforto e amor. ${imovel.cidade ? `Localizado em ${imovel.cidade},` : ""} o empreendimento reúne tudo que você precisa para viver bem.`}
            </p>

            {imovel.preco && (
              <div className="mt-6 rounded-lg p-5" style={{ backgroundColor: ACCENT }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: DARK }}>
                  {imovel.finalidade === "aluguel" ? "Aluguel a partir de" : "Unidades a partir de"}
                </p>
                <p className="font-serif text-3xl font-bold" style={{ color: DARK }}>
                  {formatLPPrice(imovel.preco)}
                </p>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            {fotos[1] ? (
              <img src={fotos[1]} alt="" className="h-80 w-full object-cover" />
            ) : (
              <div className="h-80 w-full" style={{ backgroundColor: ACCENT }} />
            )}
          </div>
        </div>
      </section>

      {/* Ficha técnica compacta */}
      {(imovel.area_total || imovel.quartos) && (
        <section className="w-full px-4 py-8" style={{ backgroundColor: PRIMARY, color: SOFT }}>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {imovel.area_total && (
              <div className="flex items-center gap-3">
                <Maximize className="h-6 w-6 opacity-70" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Área</p>
                  <p className="font-bold">{imovel.area_total} m²</p>
                </div>
              </div>
            )}
            {imovel.quartos > 0 && (
              <div className="flex items-center gap-3">
                <BedDouble className="h-6 w-6 opacity-70" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Quartos</p>
                  <p className="font-bold">{imovel.quartos}</p>
                </div>
              </div>
            )}
            {imovel.banheiros > 0 && (
              <div className="flex items-center gap-3">
                <Bath className="h-6 w-6 opacity-70" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Banheiros</p>
                  <p className="font-bold">{imovel.banheiros}</p>
                </div>
              </div>
            )}
            {imovel.vagas > 0 && (
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 opacity-70" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Vagas</p>
                  <p className="font-bold">{imovel.vagas}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Card escuro com vídeo */}
      {imovel.video_url && (
        <section className="w-full px-4 py-16" style={{ backgroundColor: DARK }}>
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              <Play className="mr-1 inline-block h-3 w-3" /> Conheça sua nova casa
            </p>
            <div className="aspect-video overflow-hidden rounded-lg">
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

      {/* Hero 2 — repetição da frase acolhedora (signature) */}
      <section className="relative h-[320px] w-full overflow-hidden md:h-[380px]">
        {fotos[2] ? (
          <img src={fotos[2]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${PRIMARY} 100%)` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute left-10 top-1/2 -translate-y-1/2 max-w-lg text-white">
          <h2 className="font-serif text-3xl font-light uppercase leading-tight drop-shadow md:text-4xl">
            {frase}
          </h2>
        </div>
      </section>

      {/* Form dourado (signature) */}
      <section className="w-full px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-xl p-8 shadow-md" style={{ backgroundColor: ACCENT }}>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: DARK }}>
              Preencha e fale com um corretor
            </p>
            <h3 className="mb-6 text-center font-serif text-2xl font-light" style={{ color: DARK }}>
              Vamos conversar?
            </h3>

            {sent ? (
              <p className="rounded-lg py-3 text-center text-sm font-semibold" style={{ backgroundColor: "white", color: DARK }}>
                Recebido! Em breve te chamamos.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-lg bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Telefone / WhatsApp"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full rounded-lg bg-white px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: DARK }}
                >
                  <Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar"}
                </button>

                {sendErr && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {sendErr}
                  </p>
                )}
              </form>
            )}
          </div>

          {corretor.whatsapp && (
            <a
              href={lpWhatsAppLink(corretor.whatsapp, headline)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ color: PRIMARY }}
            >
              <MessageCircle className="h-4 w-4" />
              Prefere WhatsApp?
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center" style={{ backgroundColor: PRIMARY, color: SOFT }}>
        <p className="font-serif text-sm">{corretor.nome}</p>
        {corretor.creci && <p className="mt-1 text-[10px] uppercase tracking-[0.3em] opacity-70">CRECI {corretor.creci}</p>}
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] opacity-60">NexoImob AI</p>
      </footer>
    </div>
  );
}
