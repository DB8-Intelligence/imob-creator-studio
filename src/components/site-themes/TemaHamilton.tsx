import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaHamilton: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const primary = config.cor_primaria || "#1685b6";
  const secondary = config.cor_secundaria || "#003d4d";
  const props = config.properties || [];

  return (
    <div className="min-h-full w-full bg-[#f4f4f4] font-['Inter',sans-serif] text-[#333]">
      {/* ── Topbar ──────────────────────────────────────────────── */}
      <div style={{ background: secondary }} className="px-6 py-2 flex items-center justify-between text-xs text-white/80">
        <div className="flex items-center gap-4">
          <span>📍 Salvador, BA</span>
          <span>📞 {config.whatsapp || "(71) 9999-0000"}</span>
        </div>
        <span>✉️ {config.email || "contato@imobiliaria.com"}</span>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <span className="text-xl font-bold" style={{ color: secondary }}>{config.nome_empresa || "Imobiliária"}</span>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#555]">
          <span className="hover:text-[#1685b6] cursor-pointer transition-colors">Início</span>
          <span className="hover:text-[#1685b6] cursor-pointer transition-colors">Imóveis</span>
          <span className="hover:text-[#1685b6] cursor-pointer transition-colors">Sobre</span>
          <span className="hover:text-[#1685b6] cursor-pointer transition-colors">Contato</span>
        </nav>
        <a href={`https://wa.me/${(config.whatsapp || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
          className="text-white text-xs font-semibold px-4 py-2 rounded" style={{ background: primary }}>
          Fale Conosco
        </a>
      </header>

      {/* ── Hero / Slider ───────────────────────────────────────── */}
      <section className="relative min-h-[360px] flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)` }}>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Encontre o imóvel dos seus sonhos
          </h1>
          <p className="text-white/70 text-sm mb-8">A melhor seleção de imóveis na sua região</p>

          {/* Search bar */}
          <div className="bg-white rounded-lg shadow-lg p-3 flex flex-wrap gap-2 items-center">
            <select className="flex-1 min-w-[100px] px-3 py-2 border border-gray-200 rounded text-sm text-[#333] bg-white outline-none">
              <option>Comprar</option>
              <option>Alugar</option>
            </select>
            <input type="text" placeholder="Cidade ou bairro..." className="flex-[2] min-w-[140px] px-3 py-2 border border-gray-200 rounded text-sm outline-none" />
            <button type="button" className="text-white text-sm font-semibold px-5 py-2 rounded" style={{ background: primary }}>
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── Features (3 cards) ──────────────────────────────────── */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🏠", title: "Comprar", desc: "Encontre o imóvel ideal para compra com as melhores condições." },
            { icon: "💰", title: "Vender", desc: "Anuncie seu imóvel e alcance milhares de compradores." },
            { icon: "🔑", title: "Alugar", desc: "Imóveis para locação em diversas regiões da cidade." },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-lg mb-2" style={{ color: secondary }}>{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ─────────────────────────────────────── */}
      <section className="px-6 py-12 bg-[#f4f4f4]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: secondary }}>Imóveis em Destaque</h2>
          {props.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhum imóvel cadastrado ainda</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {props.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Photo placeholder */}
                  <div className="h-44 relative" style={{ background: `linear-gradient(135deg, ${primary}20, ${secondary}15)` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-30">🏠</span>
                    </div>
                    {/* Badge */}
                    <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded" style={{ background: primary }}>
                      {p.status === "aluguel" ? "Aluguel" : "Venda"}
                    </span>
                  </div>
                  <div className="p-4">
                    {p.price && (
                      <p className="text-lg font-bold mb-1" style={{ color: primary }}>
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    )}
                    <h3 className="font-semibold text-sm text-[#333] mb-2 line-clamp-1">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>🛏 3</span>
                      <span>🚿 2</span>
                      <span>📐 120m²</span>
                      <span>🚗 2</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: secondary }}>Sobre {config.nome_empresa || "Nós"}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Somos uma imobiliária comprometida com a excelência no atendimento. Com anos de experiência no mercado imobiliário, ajudamos nossos clientes a encontrar o imóvel ideal com segurança e transparência.
            </p>
            <div className="flex gap-8">
              {[
                { v: "15+", l: "Anos de mercado" },
                { v: "500+", l: "Imóveis vendidos" },
                { v: "1.200+", l: "Clientes satisfeitos" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <span className="text-2xl font-bold block" style={{ color: primary }}>{s.v}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden h-56" style={{ background: `linear-gradient(135deg, ${primary}15, ${secondary}10)` }}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-20">🏢</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="px-6 py-12 bg-[#f4f4f4]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: secondary }}>O que dizem nossos clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Maria S.", text: "Encontrei meu apartamento em menos de 2 semanas. Atendimento impecável!" },
              { name: "João P.", text: "Profissionais dedicados que realmente entendem do mercado imobiliário." },
              { name: "Ana R.", text: "Vendi minha casa rapidamente e pelo preço justo. Recomendo!" },
            ].map((t) => (
              <div key={t.name} className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm" style={{ color: "#f5a623" }}>★</span>)}
                </div>
                <p className="text-sm text-gray-500 italic mb-3">"{t.text}"</p>
                <span className="text-xs font-semibold" style={{ color: secondary }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: secondary }} className="px-6 py-10 text-white/80">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-lg font-bold text-white block mb-3">{config.nome_empresa || "Imobiliária"}</span>
            <p className="text-xs leading-relaxed">Seu parceiro de confiança no mercado imobiliário. Realizando sonhos há mais de 15 anos.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Links Rápidos</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white cursor-pointer transition-colors">Imóveis à Venda</li>
              <li className="hover:text-white cursor-pointer transition-colors">Imóveis para Alugar</li>
              <li className="hover:text-white cursor-pointer transition-colors">Lançamentos</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Contato</h4>
            <ul className="space-y-2 text-xs">
              <li>📞 {config.whatsapp || "(71) 9999-0000"}</li>
              <li>✉️ {config.email || "contato@imobiliaria.com"}</li>
              <li>📍 Salvador, BA</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Redes Sociais</h4>
            <div className="flex gap-2">
              {["IG", "FB", "YT"].map((s) => (
                <span key={s} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold hover:bg-white/20 cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 text-xs text-center text-white/50">
          © 2026 {config.nome_empresa || "Imobiliária"}. Todos os direitos reservados. Powered by NexoImob AI
        </div>
      </footer>
    </div>
  );
};

export default TemaHamilton;
