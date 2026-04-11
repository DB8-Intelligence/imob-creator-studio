import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaBreza: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const primary = config.cor_primaria || "#0EA5E9";
  const secondary = config.cor_secundaria || "#38bdf8";
  const props = config.properties || [];

  return (
    <div className="min-h-full w-full bg-white font-['Nunito_Sans',sans-serif] text-gray-800">
      {/* ── Topbar ──────────────────────────────────────────────── */}
      <div style={{ background: primary }} className="px-6 py-2 flex items-center justify-between text-xs text-white pb-2.5">
        <div className="flex items-center gap-4">
          <span>📍 Atendimento em toda região costeira</span>
          <span>📞 {config.whatsapp || "(11) 9999-0000"}</span>
        </div>
        <span className="hidden sm:inline">✉️ {config.email || "contato@imob.com"}</span>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-blue-50 shadow-sm">
        <span className="text-xl font-bold" style={{ color: primary }}>{config.nome_empresa || "Minha Imobiliária"}</span>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Início</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Imóveis</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Sobre</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Depoimentos</span>
        </nav>
        <a href={`https://wa.me/${(config.whatsapp || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
          className="text-white text-sm font-bold px-5 py-2 rounded-full transition-transform hover:scale-105 shadow-md" style={{ background: primary }}>
          Fale Conosco
        </a>
      </header>

      {/* ── Hero / Slider ───────────────────────────────────────── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden" 
               style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
        {/* Soft wave visual */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block h-[50px] w-full" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.56,189.6,108.8Z" fill="#ffffff"></path>
            </svg>
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl pb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
            Um novo conceito de moradia leve
          </h1>
          <p className="text-white/90 text-lg mb-8 drop-shadow-sm">Seu bem-estar começa pelo lugar onde você vive.</p>

          {/* Search bar */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-2 flex flex-wrap gap-2 items-center border border-white/40">
            <select className="flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm text-gray-700 bg-white outline-none border-none">
              <option>Comprar</option>
              <option>Alugar</option>
            </select>
            <input type="text" placeholder="Qual cidade ou bairro?" className="flex-[2] min-w-[140px] px-4 py-3 rounded-xl text-sm outline-none border-none text-gray-700" />
            <button type="button" className="text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105" style={{ background: primary }}>
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🌅", title: "Para morar", desc: "Lares iluminados e arejados para o seu conforto." },
            { icon: "🌴", title: "Para investir", desc: "Oportunidades únicas nas áreas mais valorizadas." },
            { icon: "🏄", title: "Estilo de vida", desc: "Imóveis que combinam com o que te faz feliz." },
          ].map((f) => (
            <div key={f.title} className="text-center p-8 rounded-2xl bg-blue-50/50 border border-blue-100 hover:-translate-y-1 transition-transform">
              <span className="text-4xl mb-4 block drop-shadow-sm">{f.icon}</span>
              <h3 className="font-bold text-xl mb-2 text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ─────────────────────────────────────── */}
      <section className="px-6 py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Imóveis em Destaque</h2>
            <p className="text-gray-500">Separados com carinho para você</p>
          </div>
          {props.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum imóvel cadastrado no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {props.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
                  {/* Photo placeholder with soft gradient */}
                  <div className="h-52 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${primary}20, ${secondary}30)` }}>
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
                      <span className="text-5xl opacity-40">🏡</span>
                    </div>
                    {/* Badge */}
                    <span className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm" style={{ background: primary }}>
                      {p.status === "aluguel" ? "Alugar" : "Comprar"}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{p.property_type ?? "Imóvel"}</p>
                    <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-1 group-hover:text-blue-500 transition-colors">{p.title}</h3>
                    {p.price && (
                      <p className="text-xl font-extrabold mb-4" style={{ color: primary }}>
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                      <span className="flex items-center gap-1">🛏 2</span>
                      <span className="flex items-center gap-1">🚿 1</span>
                      <span className="flex items-center gap-1">📐 80m²</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>Nossa Essência</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">Conectando você ao lugar ideal</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Acreditamos que a busca por um imóvel não precisa ser estressante. Trazemos a leveza da brisa para o seu atendimento, com transparência e acolhimento em cada etapa da jornada.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="border-l-4 pl-4" style={{ borderColor: primary }}>
                <span className="block text-2xl font-bold text-gray-800">10k+</span>
                <span className="text-sm text-gray-500">Famílias felizes</span>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: secondary }}>
                <span className="block text-2xl font-bold text-gray-800">100%</span>
                <span className="text-sm text-gray-500">Transparência</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="rounded-3xl overflow-hidden aspect-square h-[400px] max-w-sm mx-auto shadow-2xl relative z-10 bg-blue-50 flex items-center justify-center">
               <span className="text-8xl opacity-10 drop-shadow-md">✨</span>
            </div>
            {/* Decoration blob */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-50 z-0 blur-2xl" style={{ background: secondary }}></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full opacity-30 z-0 blur-2xl" style={{ background: primary }}></div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-blue-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Histórias reais</h2>
            <p className="text-gray-500">O que falam sobre a nossa dedicação</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Carlos e Marina", text: "Achamos que ia ser super exaustivo, mas foi rápido e leve. Eles cuidaram de tudo!" },
              { name: "Letícia Gomes", text: "Estou no meu cantinho novo e muito feliz com o suporte do time inteiro." },
              { name: "Família Silva", text: "Profissionais humanos e corretos. Vendemos e compramos outra no mesmo mês." },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 relative">
                <div className="absolute -top-4 left-8 text-4xl" style={{ color: primary }}>"</div>
                <p className="text-gray-600 italic mb-6 relative z-10 mt-2"> {t.text} </p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-gray-800">{t.name}</span>
                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-gray-900 px-6 py-16 text-gray-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <span className="text-2xl font-black text-white block mb-4 tracking-tight">{config.nome_empresa || "Minha Imobiliária"}</span>
            <p className="text-sm leading-relaxed max-w-sm">Levando transparência e leveza para os seus negócios imobiliários. Compre, alugue ou venda com a melhor equipe.</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Navegue</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Início</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Imóveis</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Quem Somos</li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Fale Conosco</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><span>💬</span> {config.whatsapp || "(11) 9999-0000"}</li>
              <li className="flex items-center gap-2"><span>✉️</span> {config.email || "contato@imob.com"}</li>
              <li className="flex items-center gap-2"><span>📍</span> Nosso Escritório</li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Siga-nos</h4>
            <div className="flex gap-3">
              {["Insta", "Face", "In"].map((s) => (
                <span key={s} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white hover:bg-blue-600 transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row items-center justify-between opacity-80">
          <span>© 2026 {config.nome_empresa || "Minha Imobiliária"}. Todos os direitos reservados.</span>
          <span className="mt-2 md:mt-0">Powered by <strong className="text-white">NexoImob AI</strong></span>
        </div>
      </footer>
    </div>
  );
};

export default TemaBreza;
