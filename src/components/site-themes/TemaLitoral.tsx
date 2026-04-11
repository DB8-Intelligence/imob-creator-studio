import type { FC } from "react";
import type { SiteThemeConfig } from "./TemaBreza";

const TemaLitoral: FC<{ config: SiteThemeConfig }> = ({ config }) => {
  const navy = config.cor_primaria || "#002B5B";
  const gold = config.cor_secundaria || "#D4AF37";
  const props = config.properties || [];

  return (
    <div className="min-h-full w-full bg-[#fcfbfa] font-['Plus_Jakarta_Sans',sans-serif] text-gray-800">
      {/* ── Topbar (Thin elegant info) ──────────────────────────── */}
      <div style={{ backgroundColor: navy }} className="px-8 py-1.5 flex justify-between items-center text-[10px] uppercase tracking-[0.15em] text-white/70">
         <span>Excelência em Propriedades de Luxo</span>
         <div className="flex gap-6 hidden sm:flex">
             <span>{config.whatsapp || "+55 11 9999-0000"}</span>
             <span>{config.email || "atendimento@imob.com"}</span>
         </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white px-8 py-6 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative z-40">
        <span className="text-2xl font-bold tracking-wide font-['Cormorant_Garamond'] uppercase flex flex-col leading-none" style={{ color: navy }}>
          <span>{config.nome_empresa || "Real Estate"}</span>
          <span className="text-[9px] tracking-[0.3em] mt-1 text-gray-400 font-sans">Properties</span>
        </span>
        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
          <span className="hover:text-gray-900 cursor-pointer transition-colors relative after:absolute after:-bottom-2 after:left-1/2 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full hover:after:left-0 after:transition-all">Início</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors relative after:absolute after:-bottom-2 after:left-1/2 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full hover:after:left-0 after:transition-all">Portfólio</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors relative after:absolute after:-bottom-2 after:left-1/2 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full hover:after:left-0 after:transition-all">Lançamentos</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors relative after:absolute after:-bottom-2 after:left-1/2 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full hover:after:left-0 after:transition-all">The Agency</span>
        </nav>
        <a href={`https://wa.me/${(config.whatsapp || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
           className="hidden md:inline-block border text-[11px] font-bold uppercase tracking-widest px-6 py-3 transition-colors" 
           style={{ borderColor: gold, color: navy }}>
          Private Desk
        </a>
      </header>

      {/* ── Hero / Slider ───────────────────────────────────────── */}
      <section className="relative min-h-[550px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: navy }}>
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        {/* Subtle patterned overlay mimicking coastal elegance */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${gold} 0, ${gold} 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px'}}></div>
        
        <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center text-center">
            <div className="mb-6 h-px w-16" style={{ backgroundColor: gold }} />
            <h1 className="text-5xl md:text-6xl font-normal leading-[1.1] mb-6 font-['Cormorant_Garamond'] text-white">
              Viver o Extraordinário.
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-12 font-light">
              Uma curadoria de propriedades singulares para quem busca sofisticação e estilo de vida à beira-mar ou na montanha.
            </p>

            {/* Elegant Search bar */}
            <div className="bg-white p-2 flex flex-col sm:flex-row w-full max-w-2xl mx-auto shadow-2xl relative before:absolute before:-inset-2 before:border before:border-white/20 before:-z-10">
                <div className="flex-1 flex border-b sm:border-b-0 sm:border-r border-gray-200">
                    <span className="pl-5 pt-4 text-gray-400 text-lg">⌕</span>
                    <input type="text" placeholder="Buscar por região ou código" className="w-full px-4 py-4 outline-none text-sm bg-transparent placeholder-gray-400 font-medium" />
                </div>
                <button type="button" className="px-10 py-4 text-white text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all" style={{ backgroundColor: navy }}>
                    Explorar
                </button>
            </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="px-8 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { tag: "01", title: "Prime Locations", desc: "Acesso privilegiado às propriedades nas localizações mais desejadas." },
            { tag: "02", title: "Tailored Service", desc: "Consultoria personalizada, do primeiro contato à entrega das chaves." },
            { tag: "03", title: "Global Reach", desc: "Conexões internacionais para investimentos de alto rendimento global." },
          ].map((f) => (
            <div key={f.tag} className="flex flex-col relative group">
              <span className="text-6xl font-['Cormorant_Garamond'] text-gray-100 absolute -top-10 -left-6 z-0 group-hover:text-[#D4AF37]/10 transition-colors">{f.tag}</span>
              <div className="relative z-10 pt-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-3 uppercase tracking-wider text-[13px]" style={{ borderColor: `${gold}40` }}>{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ─────────────────────────────────────── */}
      <section className="px-8 py-24 bg-[#f9f8f6]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">Curadoria Exclusiva</span>
             <h2 className="text-4xl font-normal font-['Cormorant_Garamond']" style={{ color: navy }}>Nossas Propriedades</h2>
             <div className="mt-8 h-px w-12" style={{ backgroundColor: gold }} />
          </div>
          
          {props.length === 0 ? (
            <p className="text-center text-gray-400 py-10 uppercase tracking-widest text-sm">Portfólio em atualização.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {props.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                  {/* Photo area */}
                  <div className="h-64 relative overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 bg-navy/5 group-hover:bg-transparent transition-colors z-10"></div>
                    <div className="absolute inset-0 scale-105 group-hover:scale-100 transition-transform duration-700 flex items-center justify-center opacity-30">
                        <span className="font-['Cormorant_Garamond'] text-4xl" style={{ color: navy }}>H</span>
                    </div>
                    {/* Badge */}
                    <span className="absolute bottom-0 left-0 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest z-20 shadow-sm" style={{ color: navy }}>
                      {p.status === "aluguel" ? "Locação" : "Venda"}
                    </span>
                  </div>
                  {/* Content area */}
                  <div className="p-8 text-center border border-t-0 border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{p.property_type ?? "Propriedade"}</p>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 font-['Cormorant_Garamond'] line-clamp-1">{p.title}</h3>
                    {p.price && (
                      <p className="text-sm font-bold tracking-widest mt-4" style={{ color: gold }}>
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
              <button className="border-b uppercase text-[10px] font-bold tracking-[0.2em] pb-1 hover:text-gray-500 transition-colors" style={{ borderColor: navy, color: navy }}>Detalhar Coleção Completa</button>
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="px-8 py-24 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-normal font-['Cormorant_Garamond']" style={{ color: navy }}>Tradição & Discrécia</h2>
              <p className="text-gray-500 font-light leading-relaxed text-lg">
                Com um legado de atendimento voltado para o alto padrão, transformamos transações imobiliárias em experiências definitivas de estilo de vida e segurança patrimonial.
              </p>
              <div className="flex gap-8 pt-6">
                 <div>
                    <span className="text-3xl font-['Cormorant_Garamond'] block mb-1" style={{ color: navy }}>10+</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Anos de expertise</span>
                 </div>
                 <div>
                    <span className="text-3xl font-['Cormorant_Garamond'] block mb-1" style={{ color: navy }}>500</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Clientes Atendidos</span>
                 </div>
              </div>
           </div>
           <div className="w-full md:w-[45%] relative">
               <div className="aspect-[3/4] bg-gray-100 p-2 border" style={{ borderColor: `${gold}40` }}>
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                     <span className="text-2xl font-light font-['Cormorant_Garamond'] text-gray-400 border border-gray-400 px-6 py-2">EST. 2026</span>
                  </div>
               </div>
               <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl w-48 border border-gray-100">
                    <p className="italic font-['Cormorant_Garamond'] text-lg" style={{ color: navy }}>"Sua casa é sua mais bela assinatura."</p>
               </div>
           </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-gray-100 px-8 py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-1">
            <span className="text-2xl font-bold font-['Cormorant_Garamond'] uppercase tracking-wide block mb-6" style={{ color: navy }}>
              {config.nome_empresa || "Real Estate"}
            </span>
            <p className="text-sm font-light leading-relaxed text-gray-500">
              A curadoria imobiliária definitiva para quem não aceita menos que o excepcional.
            </p>
          </div>
          
          <div className="md:col-span-1 md:col-start-3">
            <h4 className="font-bold mb-6 uppercase text-[10px] tracking-[0.2em]" style={{ color: navy }}>Informações</h4>
            <ul className="space-y-4 text-sm font-light text-gray-500">
              <li className="hover:text-gray-900 cursor-pointer transition-colors">Portfólio</li>
              <li className="hover:text-gray-900 cursor-pointer transition-colors">Venda seu Imóvel</li>
              <li className="hover:text-gray-900 cursor-pointer transition-colors">A Agência</li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-bold mb-6 uppercase text-[10px] tracking-[0.2em]" style={{ color: navy }}>Contato</h4>
            <ul className="space-y-4 text-sm font-light text-gray-500">
              <li>{config.whatsapp || "+55 (11) 9999-0000"}</li>
              <li>{config.email || "contato@imob.com"}</li>
              <li>Av. Faria Lima, São Paulo</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-300 text-[10px] text-gray-400 uppercase tracking-widest flex flex-col md:flex-row items-center justify-between">
          <span>© 2026 {config.nome_empresa || "Real Estate"}. All Rights Reserved.</span>
          <span className="mt-4 md:mt-0 font-bold hover:text-gray-600 transition-colors cursor-pointer">Built with NexoImob AI</span>
        </div>
      </footer>
    </div>
  );
};

export default TemaLitoral;
