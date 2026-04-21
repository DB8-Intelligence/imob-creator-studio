/**
 * Template Noir — LP premium escura cinematográfica.
 * Inspirado no modelo 08 (preto + imagens fullbleed, layout L-shape, tipografia serifada branca).
 */
import { useState } from "react";
import {
  BedDouble, Bath, Maximize, Car, Phone, MessageCircle, Send, Play, MapPin,
  Home, Waves, Trees, Sun, Dumbbell, Wifi, Dog, Gem, Building2,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice, lpWhatsAppLink, getLPFotos, getLPHeadline, getLPDescricao, getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#0A0A0A"; // preto profundo
const ACCENT = "#C9A96E"; // dourado antigo
const SOFT = "#1E1E1E"; // cinza chumbo

const AMENITY_ICONS: Record<string, typeof Home> = {
  piscina: Waves, lazer: Sun, academia: Dumbbell, wifi: Wifi,
  pet: Dog, area: Trees, salao: Building2, alto: Gem,
};

function pickIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : Home;
}

export default function NoirTemplate({ imovel, lp, corretor, isPreview, onSubmitLead }: LPTemplateProps) {
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
    <div className="min-h-screen w-full font-['Inter',sans-serif] text-white" style={{ backgroundColor: PRIMARY }}>
      {/* Hero fullbleed escuro com texto serifado sobreposto */}
      <section className="relative h-screen min-h-[560px] w-full overflow-hidden">
        {fotos[0] ? (
          <img src={fotos[0]} alt={headline} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SOFT} 100%)` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)" }}
        />

        {/* Logo no topo */}
        <div className="absolute left-0 right-0 top-8 flex justify-center">
          <div className="rounded-sm bg-white/5 px-6 py-2 backdrop-blur" style={{ border: `1px solid ${ACCENT}40` }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
              {corretor.nome}
            </p>
          </div>
        </div>

        {/* Título central */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              {lp.subheadline || "Lançamento"}
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
              {headline}
            </h1>
            <div className="mx-auto mt-6 h-px w-20" style={{ backgroundColor: ACCENT }} />
          </div>
        </div>
      </section>

      {/* Descrição tipográfica sobre fundo escuro */}
      <section className="w-full px-6 py-24" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 h-px w-8" style={{ backgroundColor: ACCENT }} />
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            Conheça
          </p>
          <p className="font-serif text-xl font-light leading-relaxed text-white/90 md:text-2xl">
            {descricao ||
              `${headline} é um convite a viver o melhor de ${imovel.cidade || "sua cidade"} com sofisticação silenciosa.`}
          </p>
        </div>
      </section>

      {/* L-shape: texto + 2 imagens lado a lado */}
      <section className="w-full px-4 pb-20" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-end p-6 md:p-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
              Sobre
            </p>
            <p className="mb-6 text-sm leading-relaxed text-white/75">
              {descricao
                ? descricao.length > 180
                  ? `${descricao.slice(0, 180)}...`
                  : descricao
                : "Um endereço que define um novo padrão para a região. Detalhes pensados com rigor arquitetônico."}
            </p>
            <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
              {imovel.area_total && (
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-white/50">Área</span>
                  <span className="font-semibold">{imovel.area_total} m²</span>
                </div>
              )}
              {imovel.quartos > 0 && (
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-white/50">Quartos</span>
                  <span className="font-semibold">{imovel.quartos}</span>
                </div>
              )}
              {imovel.vagas > 0 && (
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-white/50">Vagas</span>
                  <span className="font-semibold">{imovel.vagas}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden">
            {fotos[1] ? (
              <img src={fotos[1]} alt="" className="h-full w-full object-cover grayscale transition duration-500 hover:grayscale-0" />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: SOFT }} />
            )}
          </div>

          <div className="relative aspect-[4/5] overflow-hidden">
            {fotos[2] ? (
              <img src={fotos[2]} alt="" className="h-full w-full object-cover grayscale transition duration-500 hover:grayscale-0" />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: SOFT }} />
            )}
          </div>
        </div>
      </section>

      {/* Vídeo (se houver) */}
      {imovel.video_url && (
        <section className="w-full px-4 py-20" style={{ backgroundColor: SOFT }}>
          <div className="mx-auto max-w-5xl">
            <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              <Play className="mr-1 inline-block h-3 w-3" /> Vídeo
            </p>
            <div className="aspect-video overflow-hidden bg-black" style={{ border: `1px solid ${ACCENT}30` }}>
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

      {/* Diferenciais — grid amenities em fundo escuro */}
      {amenities.length > 0 && (
        <section className="w-full px-4 py-20" style={{ backgroundColor: PRIMARY }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 h-px w-8" style={{ backgroundColor: ACCENT }} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
                Diferenciais
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {amenities.slice(0, 15).map((a) => {
                const Icon = pickIcon(a);
                return (
                  <div
                    key={a}
                    className="flex flex-col items-center gap-2 border p-5 text-center"
                    style={{ borderColor: `${ACCENT}25` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: ACCENT }} strokeWidth={1.25} />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/80">
                      {a}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Preço destacado + localização */}
      {imovel.preco && (
        <section className="w-full px-4 py-16 text-center" style={{ backgroundColor: SOFT }}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            {imovel.finalidade === "aluguel" ? "Aluguel a partir de" : "Unidades a partir de"}
          </p>
          <p className="font-serif text-5xl font-light text-white md:text-6xl">
            {formatLPPrice(imovel.preco)}
          </p>
          {(imovel.bairro || imovel.cidade) && (
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
              <MapPin className="h-3.5 w-3.5" />
              {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
            </p>
          )}
        </section>
      )}

      {/* Form premium em caixa escura */}
      <section className="w-full px-4 py-20" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto max-w-md">
          <div className="p-10 text-white" style={{ border: `1px solid ${ACCENT}40`, backgroundColor: SOFT }}>
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              Contato
            </p>
            <h3 className="mb-6 text-center font-serif text-2xl font-light">
              Solicite informações
            </h3>

            {sent ? (
              <p className="py-3 text-center text-sm" style={{ color: ACCENT }}>
                Mensagem recebida.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  style={{ borderColor: `${ACCENT}60` }}
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  style={{ borderColor: `${ACCENT}60` }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full border-b bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  style={{ borderColor: `${ACCENT}60` }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-[0.5em] transition hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT, color: PRIMARY }}
                >
                  <Send className="h-3.5 w-3.5" /> {sending ? "Enviando..." : "Enviar"}
                </button>

                {sendErr && (
                  <p className="mt-3 px-3 py-2 text-center text-[11px]" style={{ color: ACCENT }}>
                    {sendErr}
                  </p>
                )}
              </form>
            )}

            {corretor.whatsapp && (
              <a
                href={lpWhatsAppLink(corretor.whatsapp, headline)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: ACCENT }}
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto mb-3 h-px w-12" style={{ backgroundColor: ACCENT }} />
        <p className="font-serif text-sm text-white">{corretor.nome}</p>
        {corretor.creci && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.4em]" style={{ color: ACCENT, opacity: 0.7 }}>
            CRECI {corretor.creci}
          </p>
        )}
        <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-white/40">NexoImob AI</p>
      </footer>
    </div>
  );
}
