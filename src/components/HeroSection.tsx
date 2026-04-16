import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { funnel } from "@/lib/funnel";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "#21346e" }}>
      <video
        ref={videoRef}
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260206_044704_dd33cb15-c23f-4cfc-aa09-a0465d4dcb54.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(33,52,110,0.75) 0%, rgba(33,52,110,0.45) 50%, rgba(33,52,110,0.85) 100%)" }} />

      <div className="relative z-20 container mx-auto px-6 pt-32 md:pt-44 pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,215,0,0.3)", backdropFilter: "blur(10px)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#FFD700" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FFD700", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Plataforma de IA para o Mercado Imobiliário
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-bold uppercase text-white mb-10" style={{ fontFamily: "Rubik, sans-serif", fontSize: "clamp(48px, 8vw, 100px)", lineHeight: "0.98", letterSpacing: "-3px" }}>
          <span className="block">NOVA ERA</span>
          <span className="block" style={{ color: "#FFD700" }}>DO DESIGN</span>
          <span className="block">IMOBILIÁRIO</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-12 max-w-lg" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.75)", lineHeight: "1.7" }}>
          Crie seu Site, organize seus Leads e publique conteúdos com IA. Tudo automatizado, tudo integrado, tudo imobiliário.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap mb-20">
          <button type="button" onClick={() => { funnel.clickCTA("hero_primary", { destination: "/criativos" }); navigate("/criativos"); }} className="relative transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none" style={{ width: "184px", height: "65px" }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 184 65" fill="none">
              <path d="M6 0H178L184 10V55L178 65H6L0 55V10L6 0Z" fill="#FFD700" />
            </svg>
            <span className="relative z-10 flex items-center justify-center w-full h-full font-bold uppercase" style={{ fontFamily: "Rubik, sans-serif", fontSize: "13px", letterSpacing: "2px", color: "#002B5B" }}>
              COMEÇAR AGORA
            </span>
          </button>

          <button type="button" onClick={() => document.getElementById("solucoes")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 font-bold uppercase transition-all hover:border-yellow-400 hover:text-yellow-400" style={{ fontFamily: "Rubik, sans-serif", fontSize: "13px", letterSpacing: "2px", color: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "4px", padding: "0 24px", height: "65px", background: "transparent" }}>
            VER SOLUÇÕES
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 md:gap-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {[
            { v: "500+", l: "corretores ativos" },
            { v: "6", l: "módulos integrados" },
            { v: "30s", l: "por criativo gerado" },
            { v: "3×", l: "mais alcance digital" },
          ].map((s) => (
            <div key={s.l}>
              <span className="block font-bold" style={{ fontFamily: "Rubik, sans-serif", fontSize: "32px", color: "#FFD700", lineHeight: 1 }}>{s.v}</span>
              <span className="block mt-1 uppercase" style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.45)" }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer" onClick={() => document.getElementById("solucoes")?.scrollIntoView({ behavior: "smooth" })}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </section>
  );
}
