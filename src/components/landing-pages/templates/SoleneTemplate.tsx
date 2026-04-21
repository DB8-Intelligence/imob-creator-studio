/**
 * Template Solene — LP corporativo luxo lançamento.
 * Inspirado no modelo 10 (navy + dourado, badge + form lateral, grid 4x3 amenities).
 */
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, Car, Phone, MessageCircle, Send, Play,
  Home, Waves, Trees, Sun, Dumbbell, Wifi, Dog, Gem, Building2, Snowflake,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice, lpWhatsAppLink, getLPFotos, getLPHeadline, getLPDescricao, getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#1B2A4A"; // navy profundo
const ACCENT = "#C9A96E"; // dourado
const SOFT = "#F5F3EE"; // off-white cremoso

const AMENITY_ICONS: Record<string, typeof Home> = {
  piscina: Waves, academia: Dumbbell, wifi: Wifi, pet: Dog,
  ar: Snowflake, area: Trees, sol: Sun, salao: Building2, alto: Gem,
};

function pickIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : Home;
}

export default function SoleneTemplate({ imovel, lp, corretor, isPreview, onSubmitLead }: LPTemplateProps) {
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

  return (
    <div className="min-h-screen w-full font-['Inter',sans-serif]" style={{ backgroundColor: SOFT }}>
      {/* Hero composto — imagem + badge + form lateral (signature) */}
      <section className="relative min-h-[620px] w-full overflow-hidden">
        {fotos[0] ? (
          <img src={fotos[0]} alt={headline} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d4366 100%)` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${PRIMARY}E6 0%, ${PRIMARY}80 50%, ${PRIMARY}60 100%)` }} />

        {/* Logo topo centralizado */}
        <div className="absolute left-0 right-0 top-8 flex justify-center">
          <div
            className="rounded-sm px-6 py-2"
            style={{ backgroundColor: ACCENT, color: PRIMARY }}
          >
            <Gem className="mr-2 inline-block h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{corretor.nome}</span>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-24 md:grid-cols-2 md:items-center">
          {/* Badge + headline */}
          <div className="text-white">
            <div
              className="mb-5 inline-block rounded-sm px-4 py-1.5"
              style={{ backgroundColor: ACCENT, color: PRIMARY }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
                {lp.subheadline || "Lançamento exclusivo"}
              </p>
            </div>

            <h1 className="mb-4 font-serif text-4xl font-light uppercase leading-tight drop-shadow md:text-5xl lg:text-6xl">
              {headline}
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-white/85">
              {descricao
                ? descricao.length > 140
                  ? `${descricao.slice(0, 140)}...`
                  : descricao
                : `Um empreendimento que redefine o padrão em ${imovel.cidade || "sua cidade"}. Arquitetura, localização e acabamento de primeira linha.`}
            </p>

            {imovel.preco && (
              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                  {imovel.finalidade === "aluguel" ? "Aluguel a partir de" : "Unidades a partir de"}
                </p>
                <p className="font-serif text-3xl font-light md:text-4xl">
                  {formatLPPrice(imovel.preco)}
                </p>
              </div>
            )}
          </div>

          {/* Form lateral dourado — signature */}
          <div className="md:ml-auto md:max-w-sm">
            <div
              className="rounded-sm p-6 shadow-2xl"
              style={{ backgroundColor: PRIMARY, border: `1px solid ${ACCENT}60` }}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                Confira as condições
              </p>
              <h3 className="mb-5 font-serif text-xl font-light text-white">
                Interesse em saber mais?
              </h3>

              {sent ? (
                <p className="rounded-sm py-3 text-center text-sm" style={{ backgroundColor: ACCENT, color: PRIMARY }}>
                  Mensagem recebida!
                </p>
              ) : (
                <form onSubmit={submit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full rounded-sm bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                    style={{ border: `1px solid ${ACCENT}40` }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-sm bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                    style={{ border: `1px solid ${ACCENT}40` }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Telefone"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full rounded-sm bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                    style={{ border: `1px solid ${ACCENT}40` }}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] transition hover:brightness-110 disabled:opacity-60"
                    style={{ backgroundColor: ACCENT, color: PRIMARY }}
                  >
                    <Send className="h-3.5 w-3.5" /> {sending ? "Enviando..." : "Enviar"}
                  </button>

                  {sendErr && (
                    <p className="mt-2 rounded-sm bg-red-500/20 px-3 py-2 text-[11px] text-red-100">
                      {sendErr}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vídeo + texto sobre lado a lado */}
      {imovel.video_url && (
        <section className="w-full px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
            <div className="aspect-video overflow-hidden rounded-sm shadow-lg">
              <iframe
                src={imovel.video_url.replace("watch?v=", "embed/")}
                title="Vídeo"
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
                <Play className="mr-1 inline-block h-3 w-3" /> Conheça o projeto
              </p>
              <h2 className="mb-4 font-serif text-3xl font-light leading-tight" style={{ color: PRIMARY }}>
                Um endereço único
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {descricao || "Cada detalhe pensado com rigor arquitetônico. Do projeto paisagístico aos acabamentos, tudo converge para um padrão único."}
              </p>
              <div className="mt-4 h-px w-16" style={{ backgroundColor: ACCENT }} />
            </div>
          </div>
        </section>
      )}

      {/* Descrição ampla em banda */}
      <section className="w-full px-4 py-16" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            Descrição
          </p>
          <p className="font-serif text-lg font-light leading-relaxed md:text-xl">
            {descricao ||
              `${headline} compõe-se de unidades cuidadosamente projetadas, com área de lazer completa e infraestrutura de alto padrão.`}
          </p>
        </div>
      </section>

      {/* Imagem única grande */}
      {fotos[1] && (
        <section className="w-full">
          <img src={fotos[1]} alt="" className="h-80 w-full object-cover md:h-[500px]" />
        </section>
      )}

      {/* Grid "Diferenciais" 4x3 = 12 amenities (signature) */}
      {amenities.length > 0 && (
        <section className="w-full px-4 py-16" style={{ backgroundColor: SOFT }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
                Exclusivo
              </p>
              <h2 className="font-serif text-3xl font-light" style={{ color: PRIMARY }}>
                Diferenciais
              </h2>
              <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: ACCENT }} />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {amenities.slice(0, 12).map((a) => {
                const Icon = pickIcon(a);
                return (
                  <div
                    key={a}
                    className="flex items-center gap-3 rounded-sm bg-white p-5 shadow-sm"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: ACCENT }} strokeWidth={1.25} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: PRIMARY }}>
                      {a}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ficha técnica */}
      {(imovel.area_total || imovel.quartos) && (
        <section className="w-full px-4 py-12" style={{ backgroundColor: PRIMARY, color: SOFT }}>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {imovel.area_total && (
              <div className="text-center">
                <Maximize className="mx-auto mb-2 h-6 w-6" style={{ color: ACCENT }} />
                <p className="text-[10px] uppercase tracking-wider opacity-70">Área</p>
                <p className="text-lg font-bold">{imovel.area_total} m²</p>
              </div>
            )}
            {imovel.quartos > 0 && (
              <div className="text-center">
                <BedDouble className="mx-auto mb-2 h-6 w-6" style={{ color: ACCENT }} />
                <p className="text-[10px] uppercase tracking-wider opacity-70">Quartos</p>
                <p className="text-lg font-bold">{imovel.quartos}</p>
              </div>
            )}
            {imovel.banheiros > 0 && (
              <div className="text-center">
                <Bath className="mx-auto mb-2 h-6 w-6" style={{ color: ACCENT }} />
                <p className="text-[10px] uppercase tracking-wider opacity-70">Banheiros</p>
                <p className="text-lg font-bold">{imovel.banheiros}</p>
              </div>
            )}
            {imovel.vagas > 0 && (
              <div className="text-center">
                <Car className="mx-auto mb-2 h-6 w-6" style={{ color: ACCENT }} />
                <p className="text-[10px] uppercase tracking-wider opacity-70">Vagas</p>
                <p className="text-lg font-bold">{imovel.vagas}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA final "Gostou? Fale com um corretor" */}
      <section className="w-full px-4 py-16 text-center" style={{ backgroundColor: SOFT }}>
        <div className="mx-auto max-w-xl">
          <p className="mb-3 font-serif text-2xl font-light" style={{ color: PRIMARY }}>
            Gostou? Fale com um corretor.
          </p>
          {corretor.whatsapp && (
            <a
              href={lpWhatsAppLink(corretor.whatsapp, headline)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm px-8 py-3 text-xs font-bold uppercase tracking-[0.4em] transition hover:brightness-110"
              style={{ backgroundColor: ACCENT, color: PRIMARY }}
            >
              <MessageCircle className="h-4 w-4" /> Falar com consultor
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center" style={{ backgroundColor: PRIMARY, color: SOFT }}>
        <div className="mx-auto mb-3 h-px w-12" style={{ backgroundColor: ACCENT }} />
        <p className="font-serif text-sm">{corretor.nome}</p>
        {corretor.creci && <p className="mt-1 text-[10px] uppercase tracking-[0.4em] opacity-70">CRECI {corretor.creci}</p>}
        <p className="mt-3 text-[10px] uppercase tracking-[0.4em] opacity-60">NexoImob AI</p>
      </footer>
    </div>
  );
}
