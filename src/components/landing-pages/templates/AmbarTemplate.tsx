/**
 * Template Âmbar — LP de lançamento alto padrão.
 * Inspirado no modelo Villa Amalfi (dourado + roxo escuro, hero 3-col, form bege).
 */
import { useState } from "react";
import {
  BedDouble,
  Bath,
  Maximize,
  Car,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Play,
  Compass,
} from "lucide-react";
import type { LPTemplateProps } from "@/types/landing-page";
import {
  formatLPPrice,
  lpWhatsAppLink,
  getLPFotos,
  getLPHeadline,
  getLPDescricao,
  getLPAmenities,
} from "@/types/landing-page";

const PRIMARY = "#B19A6B"; // dourado tan
const SECONDARY = "#3D2B47"; // roxo escuro
const DARK_BG = "#2A2630";

export default function AmbarTemplate({ imovel, lp, corretor, isPreview }: LPTemplateProps) {
  const fotos = getLPFotos(imovel, lp);
  const headline = getLPHeadline(imovel, lp);
  const descricao = getLPDescricao(imovel, lp);
  const amenities = getLPAmenities(imovel, lp);
  const subheadline = lp.subheadline || "Lançamento exclusivo";

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    celular: "",
    mensagem: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    setSubmitting(true);
    // TODO: integrar com site_leads / criar lead no backend
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen w-full font-['Inter',sans-serif]"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* ───── Topo: logo/nome do empreendimento em card bege ───── */}
      <div className="w-full py-5" style={{ backgroundColor: DARK_BG }}>
        <div className="mx-auto max-w-md">
          <div
            className="mx-4 rounded-sm px-6 py-4 text-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <h1
              className="font-serif text-2xl font-bold uppercase tracking-[0.15em] text-white md:text-3xl"
              style={{ color: SECONDARY }}
            >
              {headline}
            </h1>
            <p
              className="font-serif italic"
              style={{ color: SECONDARY, opacity: 0.8 }}
            >
              {subheadline}
            </p>
          </div>
        </div>
      </div>

      {/* ───── Hero 3-blocos: foto externa + card info + foto interna ───── */}
      <section className="relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Foto 1 (lazer externo) */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[340px]">
            {fotos[0] ? (
              <img
                src={fotos[0]}
                alt={imovel.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${SECONDARY} 0%, ${PRIMARY} 100%)`,
                }}
              >
                <span className="text-6xl opacity-30">🏖️</span>
              </div>
            )}
          </div>

          {/* Card central com info-chave (dormitórios, lazer, preço) */}
          <div
            className="relative flex flex-col items-center justify-center px-6 py-10 text-center"
            style={{ backgroundColor: SECONDARY }}
          >
            <div
              className="mb-4 rounded-sm px-6 py-6"
              style={{ backgroundColor: PRIMARY, minWidth: "200px" }}
            >
              <p
                className="text-3xl font-extrabold leading-none md:text-4xl"
                style={{ color: SECONDARY }}
              >
                {imovel.quartos || 3}
              </p>
              <p
                className="mt-1 text-sm font-semibold uppercase tracking-widest"
                style={{ color: SECONDARY }}
              >
                {imovel.quartos === 1 ? "dormitório" : "dormitórios"}
              </p>
              <div
                className="mx-auto my-3 h-px w-10"
                style={{ backgroundColor: SECONDARY }}
              />
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: SECONDARY }}
              >
                Lazer completo
              </p>
            </div>

            {imovel.preco && (
              <div className="mt-2 text-white">
                <p className="text-xs uppercase tracking-widest opacity-70">
                  {imovel.finalidade === "aluguel" ? "aluguel a partir de" : "unidades a partir de"}
                </p>
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: PRIMARY }}
                >
                  {formatLPPrice(imovel.preco)}
                </p>
              </div>
            )}
          </div>

          {/* Foto 3 (ambiente interno) */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[340px]">
            {fotos[1] ? (
              <img
                src={fotos[1]}
                alt={imovel.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
                }}
              >
                <span className="text-6xl opacity-30">🛋️</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───── Bem-vindo ───── */}
      <section className="w-full py-14 text-center" style={{ backgroundColor: DARK_BG }}>
        <div className="mx-auto max-w-2xl px-6 text-white">
          <h2
            className="mb-3 text-xl font-bold uppercase tracking-widest md:text-2xl"
            style={{ color: PRIMARY }}
          >
            Seja bem-vindo!
          </h2>
          <p className="text-base leading-relaxed text-white/80">
            {descricao ||
              `No residencial ${headline}, você encontra o melhor de ${imovel.cidade || "sua cidade"} para sua família.`}
          </p>
        </div>
      </section>

      {/* ───── Sobre o empreendimento (card roxo escuro com CTAs WhatsApp) ───── */}
      <section className="w-full px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-sm px-8 py-10 text-center text-white"
            style={{ backgroundColor: SECONDARY }}
          >
            <p
              className="mb-4 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: PRIMARY }}
            >
              Sobre o empreendimento
            </p>

            <p className="mb-6 text-sm leading-relaxed text-white/85 md:text-base">
              {descricao
                ? descricao.length > 280
                  ? `${descricao.slice(0, 280)}...`
                  : descricao
                : "Um dos mais modernos projetos da região, concebido com arquitetura contemporânea e lazer completo. Venha conhecer o novo modo de viver."}
            </p>

            {amenities.length > 0 && (
              <p className="mb-6 text-sm leading-relaxed text-white/75">
                <span className="font-bold" style={{ color: PRIMARY }}>
                  Lazer completo:
                </span>{" "}
                {amenities.slice(0, 12).join(", ")}
                {amenities.length > 12 ? " e muito mais!" : "."}
              </p>
            )}

            <p
              className="mb-4 font-semibold"
              style={{ color: PRIMARY }}
            >
              Agende sua visita! Converse com um consultor por telefone ou WhatsApp:
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {corretor.telefone && (
                <a
                  href={`tel:${corretor.telefone}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" style={{ color: PRIMARY }} />
                  {corretor.telefone}
                </a>
              )}
              {corretor.whatsapp && (
                <a
                  href={lpWhatsAppLink(corretor.whatsapp, headline)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-110"
                  style={{ backgroundColor: PRIMARY, color: SECONDARY }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Galeria (ambiente interno de destaque + specs) ───── */}
      {(fotos.length > 2 || imovel.area_total) && (
        <section className="w-full px-4 py-10" style={{ backgroundColor: DARK_BG }}>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
              <div className="overflow-hidden rounded-sm">
                {fotos[2] ? (
                  <img
                    src={fotos[2]}
                    alt="Ambiente"
                    className="h-64 w-full object-cover md:h-80"
                  />
                ) : (
                  <div
                    className="flex h-64 items-center justify-center md:h-80"
                    style={{
                      background: `linear-gradient(135deg, ${SECONDARY} 0%, ${PRIMARY} 100%)`,
                    }}
                  >
                    <span className="text-6xl opacity-30">🏠</span>
                  </div>
                )}
              </div>

              <div className="text-white">
                <p
                  className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: PRIMARY }}
                >
                  Ficha técnica
                </p>
                <div className="space-y-3 text-sm">
                  {imovel.area_total && (
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Maximize className="h-5 w-5" style={{ color: PRIMARY }} />
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Área total</p>
                        <p className="font-semibold">{imovel.area_total} m²</p>
                      </div>
                    </div>
                  )}
                  {imovel.quartos > 0 && (
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <BedDouble className="h-5 w-5" style={{ color: PRIMARY }} />
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Quartos</p>
                        <p className="font-semibold">
                          {imovel.quartos}
                          {imovel.suites > 0 && ` (${imovel.suites} suítes)`}
                        </p>
                      </div>
                    </div>
                  )}
                  {imovel.banheiros > 0 && (
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Bath className="h-5 w-5" style={{ color: PRIMARY }} />
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Banheiros</p>
                        <p className="font-semibold">{imovel.banheiros}</p>
                      </div>
                    </div>
                  )}
                  {imovel.vagas > 0 && (
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Car className="h-5 w-5" style={{ color: PRIMARY }} />
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Vagas</p>
                        <p className="font-semibold">{imovel.vagas}</p>
                      </div>
                    </div>
                  )}
                  {(imovel.bairro || imovel.cidade) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" style={{ color: PRIMARY }} />
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider">Localização</p>
                        <p className="font-semibold">
                          {[imovel.bairro, imovel.cidade, imovel.estado]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───── Vídeo ───── */}
      {imovel.video_url && (
        <section className="w-full px-4 py-10" style={{ backgroundColor: "#1A1720" }}>
          <div className="mx-auto max-w-4xl">
            <p
              className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: PRIMARY }}
            >
              <Play className="mr-2 inline-block h-4 w-4" />
              Vídeo
            </p>
            <div className="aspect-video overflow-hidden rounded-sm bg-black">
              <iframe
                src={imovel.video_url.replace("watch?v=", "embed/")}
                title="Vídeo do imóvel"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* ───── Tour 360° ───── */}
      {imovel.tour_virtual_url && (
        <section className="w-full px-4 py-10" style={{ backgroundColor: "#1A1720" }}>
          <div className="mx-auto max-w-4xl">
            <p
              className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: PRIMARY }}
            >
              <Compass className="mr-2 inline-block h-4 w-4" />
              Tour 360°
            </p>
            <div className="aspect-video overflow-hidden rounded-sm bg-black">
              <iframe
                src={imovel.tour_virtual_url}
                title="Tour virtual"
                className="h-full w-full"
                allow="accelerometer; autoplay; gyroscope"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* ───── Formulário (CTA principal) ───── */}
      <section className="w-full py-14" style={{ backgroundColor: DARK_BG }}>
        <div className="mx-auto max-w-xl px-4">
          <div
            className="rounded-sm p-8 shadow-lg"
            style={{ backgroundColor: PRIMARY }}
          >
            <h3
              className="mb-2 text-center text-lg font-bold uppercase tracking-widest"
              style={{ color: SECONDARY }}
            >
              Entre em contato
            </h3>
            <p
              className="mb-6 text-center text-sm"
              style={{ color: SECONDARY, opacity: 0.85 }}
            >
              Gostou do lançamento? Preencha os dados e um consultor entrará em
              contato.
            </p>

            {submitted ? (
              <div
                className="rounded-sm bg-white/30 p-6 text-center text-white"
              >
                <p className="font-bold">Recebemos sua mensagem!</p>
                <p className="mt-1 text-sm opacity-90">
                  Em breve um consultor entrará em contato.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full rounded-sm bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-sm bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full rounded-sm bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  type="tel"
                  placeholder="Celular / WhatsApp"
                  required
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  className="w-full rounded-sm bg-white px-4 py-3 text-sm outline-none"
                />
                <textarea
                  placeholder="Mensagem"
                  rows={3}
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  className="w-full resize-none rounded-sm bg-white px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: SECONDARY }}
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Enviando..." : "Enviar"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ───── Rodapé corretor ───── */}
      <footer
        className="w-full px-4 py-8 text-center"
        style={{ backgroundColor: "#1A1720" }}
      >
        <div className="mx-auto max-w-3xl text-xs text-white/60">
          <p className="mb-1 font-semibold text-white">{corretor.nome}</p>
          {corretor.creci && (
            <p className="mb-2 uppercase tracking-widest">CRECI {corretor.creci}</p>
          )}
          <p className="opacity-70">
            Gerado com NexoImob AI • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
