import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaUrbano: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const primary = config.cor_primaria || "#111827"; // Dark base
  const accent = config.cor_secundaria || "#F97316"; // Orange accent
  const props = config.properties || [];

  return (
    <div className="min-h-full w-full bg-black font-['Barlow',sans-serif] text-gray-300">
      {/* ── Topbar ──────────────────────────────────────────────── */}
      <div className="px-6 py-2 border-b border-gray-800 flex justify-between items-center text-xs font-medium uppercase tracking-widest text-gray-500">
        <div className="hidden sm:flex gap-6">
          <span>Creci J-12345</span>
          <span>Redefinindo o mercado.</span>
        </div>
        <div className="flex gap-4 items-center ml-auto">
          <span className="hover:text-white transition-colors cursor-pointer">Login</span>
          <span className="w-px h-3 bg-gray-800"></span>
          <span className="hover:text-white transition-colors cursor-pointer">Anuncie</span>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-gray-900">
        <span className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
          {config.nome_empresa || "Imobiliária"}
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }}></span>
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
          <span className="text-white cursor-pointer transition-colors">Início</span>
          <span className="hover:text-white cursor-pointer transition-colors">Imóveis</span>
          <span className="hover:text-white cursor-pointer transition-colors">Lançamentos</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contato</span>
        </nav>
        <a href={`https://wa.me/${(config.whatsapp || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
           className="text-black text-sm font-black uppercase tracking-wider px-6 py-2.5 rounded transition-transform hover:scale-105" 
           style={{ backgroundColor: accent }}>
          Falar com Broker
        </a>
      </header>

      {/* ── Hero / Slider ───────────────────────────────────────── */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden border-b border-gray-900" 
               style={{ background: `radial-gradient(circle at center, #1f2937 0%, #000 100%)` }}>
        {/* Urban grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 text-left">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest border border-gray-800 rounded-full mb-6 inline-block" style={{ color: accent }}>Altíssimo Padrão</span>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase leading-[0.9] tracking-tighter">
                  A cidade aos <br/> <span style={{ color: accent }}>seus pés.</span>
                </h1>
                <p className="text-gray-400 text-lg mb-10 max-w-md font-medium leading-relaxed">
                  Imóveis selecionados com rigor para quem respira o estilo de vida metropolitano.
                </p>
            </div>

            {/* Dark Search bar */}
            <div className="flex-1 w-full bg-gray-900/80 backdrop-blur-md border border-gray-800 p-6 rounded-xl shadow-2xl">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Busca Rápida</h3>
                <div className="space-y-4">
                    <select className="w-full px-4 py-3 rounded text-sm text-white bg-black border border-gray-800 outline-none focus:border-orange-500 uppercase font-medium tracking-wide">
                        <option>Status: Comprar</option>
                        <option>Status: Alugar</option>
                    </select>
                    <input type="text" placeholder="Localização / Bairro" className="w-full px-4 py-3 rounded text-sm outline-none border border-gray-800 bg-black text-white focus:border-orange-500 font-medium" />
                    <button type="button" className="w-full text-black text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded transition-colors hover:brightness-110 mt-2" style={{ background: accent }}>
                        Encontrar
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-black border-b border-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "■", title: "Curadoria", desc: "Apenas 10% dos imóveis avaliados entram no nosso portfólio." },
            { icon: "►", title: "Agilidade", desc: "Processo digitalizado, sem burocracia e com assessoria completa." },
            { icon: "▲", title: "Exclusividade", desc: "Acesso direto aos lançamentos mais cobiçados da região." },
          ].map((f) => (
            <div key={f.title} className="text-left p-8 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors group">
              <span className="text-2xl mb-5 block" style={{ color: accent }}>{f.icon}</span>
              <h3 className="font-black text-white text-xl mb-2 uppercase tracking-wide group-hover:text-orange-500 transition-colors">{f.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ─────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto flex flex-col">
          <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-4">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Portfólio</h2>
            <span className="text-sm font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors" style={{ color: accent }}>Ver todos ↗</span>
          </div>
          
          {props.length === 0 ? (
            <p className="text-center text-gray-600 py-10 uppercase tracking-widest text-sm font-bold">Nenhum ativo listado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {props.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-black border border-gray-800 overflow-hidden hover:border-gray-600 transition-all group">
                  {/* Image Area */}
                  <div className="h-56 relative overflow-hidden bg-gray-900 flex items-center justify-center">
                    <span className="text-6xl opacity-10 filter grayscale font-black text-white select-none group-hover:scale-110 transition-transform duration-700">{p.property_type?.[0] || 'X'}</span>
                    <div className="absolute inset-0 border-[4px] border-black pointer-events-none z-10"></div>
                  </div>
                  {/* Content Area */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{p.property_type ?? "Urbano"}</p>
                            <h3 className="font-bold text-lg text-white line-clamp-1">{p.title}</h3>
                        </div>
                        <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-black bg-white">
                        {p.status === "aluguel" ? "Rent" : "Buy"}
                        </span>
                    </div>
                    
                    {p.price && (
                      <p className="text-2xl font-black tracking-tight mb-4 text-white">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider pt-4 border-t border-gray-900">
                      <span>3 DORM</span>
                      <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                      <span>2 SUÍTES</span>
                      <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                      <span>120 M²</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About / Metrics ─────────────────────────────────────── */}
      <section className="px-6 py-24 bg-black">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 w-full relative h-[400px]">
                {/* Abstract geometric graphic */}
                <div className="absolute inset-0 border border-gray-800 flex">
                   <div className="w-1/2 h-full border-r border-gray-800 bg-gray-900/20"></div>
                   <div className="w-1/2 h-full flex flex-col">
                      <div className="h-1/2 border-b border-gray-800 w-full flex items-center justify-center overflow-hidden">
                         <div className="w-64 h-64 border rounded-full border-gray-800 -mr-32 -mt-32"></div>
                      </div>
                      <div className="h-1/2 w-full bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                   </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%,transparent_75%,#1f2937_75%,#1f2937),linear-gradient(45deg,#1f2937_25%,transparent_25%,transparent_75%,#1f2937_75%,#1f2937)] bg-[length:10px_10px] bg-[position:0_0,5px_5px] z-10 opacity-30"></div>
            </div>
            <div className="flex-1 space-y-8">
                <div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">A excelência no <br/>mercado atual.</h2>
                   <p className="text-gray-400 font-medium leading-relaxed">
                     Somos a ponte entre investidores exigentes e ativos de alta performance. Deixe a complexidade conosco e foque apenas nos resultados.
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-900 border border-gray-900">
                   <div className="bg-black p-6">
                       <span className="block text-3xl font-black text-white">R$ 2B+</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2 block">VGV Negociado</span>
                   </div>
                   <div className="bg-black p-6">
                       <span className="block text-3xl font-black text-white">12</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2 block">Anos de atuação</span>
                   </div>
                </div>
            </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gray-950 border-y border-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter">O que dizem</h2>
             <span className="text-3xl font-serif italic text-gray-700">"</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "S. Rossi", role: "Investidor", text: "Visão analítica de mercado invejável. Indispensáveis para composição de carteira imobiliária." },
              { name: "A. Müller", role: "CEO", text: "Venderam minha cobertura com extrema discrição e profissionalismo, focado no cliente ideal." },
            ].map((t, idx) => (
              <div key={idx} className="bg-black border border-gray-800 p-8 hover:border-gray-700 transition-colors">
                 <p className="text-gray-400 font-medium mb-8 leading-relaxed"> {t.text} </p>
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center font-black text-gray-500">
                         {t.name.charAt(0)}
                     </div>
                     <div>
                         <span className="block font-bold text-white text-sm uppercase tracking-wide">{t.name}</span>
                         <span className="block text-[10px] text-gray-500 uppercase tracking-widest">{t.role}</span>
                     </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-black px-6 py-16 text-gray-500 border-t border-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <span className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-2 mb-6">
              {config.nome_empresa || "Imobiliária"}
            </span>
            <p className="text-sm font-medium leading-relaxed mb-6 max-w-sm">Brokerage & Advisory de alta performance. Inteligência de mercado aliada a conexões exclusivas.</p>
            <div className="flex gap-4">
              <span className="text-white hover:text-orange-500 cursor-pointer uppercase text-[10px] font-bold tracking-widest">LinkedIn</span>
              <span className="text-white hover:text-orange-500 cursor-pointer uppercase text-[10px] font-bold tracking-widest">Instagram</span>
            </div>
          </div>
          
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Escritório</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>Av. Paulista, 1000 — 15º Andar<br/>São Paulo, SP</li>
              <li className="text-white">{config.whatsapp || "(11) 9999-0000"}</li>
              <li className="text-white">{config.email || "contato@imob.com"}</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Menu</h4>
            <ul className="space-y-4 text-sm font-medium uppercase tracking-wider text-[11px]">
              <li className="hover:text-white cursor-pointer transition-colors">Home</li>
              <li className="hover:text-white cursor-pointer transition-colors">Portfólio</li>
              <li className="hover:text-white cursor-pointer transition-colors">Investimentos</li>
              <li className="hover:text-white cursor-pointer transition-colors">Fale Conosco</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-900 text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row items-center justify-between">
          <span>© 2026 {config.nome_empresa || "Imobiliária"}. CNPJ: 00.000.000/0001-00</span>
          <span className="mt-4 md:mt-0 opacity-50">System by NexoImob AI</span>
        </div>
      </footer>
    </div>
  );
};

export default TemaUrbano;
