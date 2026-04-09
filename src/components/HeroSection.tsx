import { useEffect, useRef, useState } from "react";

const LOGOS = [
  { name: "ANTHROPIC", path: "M12 2L2 19h4l2-4h8l2 4h4L12 2zm0 5l3 6H9l3-6z" },
  { name: "SUPABASE", path: "M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 2l-3 5h6l-3-5z" },
  { name: "OPENAI", path: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5z" },
  { name: "VERCEL", path: "M12 2L2 20h20L12 2z" },
  { name: "RAILWAY", path: "M4 4h16v4H4zm0 6h10v4H4zm0 6h16v4H4z" },
  { name: "FAL.AI", path: "M3 12h18M12 3v18M5 5l14 14M19 5L5 19" },
  { name: "META", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
  { name: "ZAP IMÓVEIS", path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
];

function InfiniteSlider() {
  const items = [...LOGOS, ...LOGOS];
  return (
    <div style={{ overflow: "hidden", flex: 1, maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}>
      <div style={{
        display: "flex", gap: "48px", alignItems: "center",
        animation: "logoScroll 28s linear infinite", width: "max-content"
      }}>
        {items.map((logo, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "8px",
            opacity: 0.45, filter: "brightness(0) invert(1)",
            whiteSpace: "nowrap", flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={logo.path} />
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "white", fontFamily: "inherit" }}>
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @keyframes logoScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pillPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(255,215,0,0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        .hero-cta-primary {
          position: relative; display: inline-flex; align-items: center;
          gap: 12px; padding: 0 6px 0 26px; height: 58px;
          background: #FFD700; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 13px; letter-spacing: 2px; color: #010101;
          text-transform: uppercase; border-radius: 4px;
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hero-cta-primary:hover {
          transform: scale(1.04);
          box-shadow: 0 0 32px rgba(255,215,0,0.5);
        }
        .hero-cta-primary:active { transform: scale(0.97); }
        .hero-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0 24px; height: 58px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: 2px; color: rgba(255,255,255,0.65);
          text-transform: uppercase; border-radius: 4px; cursor: pointer;
          transition: all 0.2s; backdrop-filter: blur(8px);
        }
        .hero-cta-secondary:hover {
          border-color: rgba(255,215,0,0.5);
          color: #FFD700;
          background: rgba(255,215,0,0.05);
        }
        .video-container video {
          mix-blend-mode: screen;
        }
      `}</style>

      <section style={{
        position: "relative", background: "#010101",
        minHeight: "100vh", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif"
      }}>

        {/* Noise texture overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "128px 128px"
        }} />

        {/* Radial glow — Navy */}
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "600px", zIndex: 2,
          background: "radial-gradient(ellipse at center, rgba(0,43,91,0.6) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Gold accent glow top-right */}
        <div style={{
          position: "absolute", top: "10%", right: "-5%",
          width: "400px", height: "400px", zIndex: 2,
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* HERO CONTENT */}
        <div style={{
          position: "relative", zIndex: 20,
          maxWidth: "1100px", margin: "0 auto",
          padding: "0 32px",
          paddingTop: "clamp(100px, 14vw, 180px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center"
        }}>

          {/* Announcement pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 16px 6px 8px",
            borderRadius: "999px",
            background: "rgba(28, 27, 36, 0.6)",
            border: "1px solid rgba(255,215,0,0.25)",
            backdropFilter: "blur(12px)",
            marginBottom: "36px",
            animation: "fadeUp 0.6s ease both",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pillPulse 2.5s ease infinite",
              flexShrink: 0
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#010101" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>
              Usado por corretores. Amado por imobiliárias.
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(48px, 7.5vw, 88px)",
            lineHeight: 1.0,
            letterSpacing: "-3px",
            margin: "0 0 24px",
            animation: "fadeUp 0.6s 0.1s ease both",
            opacity: 0,
          }}>
            <span style={{ display: "block", color: "#ffffff" }}>
              Sua visão
            </span>
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #FFD700 0%, #FFF0A0 40%, #FFD700 70%, #B8860B 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              nossa realidade digital.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: "clamp(15px, 1.6vw, 18px)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "520px",
            lineHeight: 1.7,
            margin: "0 0 44px",
            fontWeight: 300,
            animation: "fadeUp 0.6s 0.2s ease both",
            opacity: 0,
          }}>
            Transformamos fotos de imóveis em criativos profissionais, vídeos cinematográficos e publicações automáticas — em segundos, com IA.
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            flexWrap: "wrap", justifyContent: "center",
            marginBottom: "80px",
            animation: "fadeUp 0.6s 0.3s ease both",
            opacity: 0,
          }}>
            <button className="hero-cta-primary" onClick={() => { window.location.href = "/auth"; }}>
              Começar agora
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#010101" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </button>

            <button className="hero-cta-secondary" onClick={() => { window.location.href = "/planos"; }}>
              Ver planos
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: "clamp(24px, 5vw, 64px)",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            animation: "fadeUp 0.6s 0.4s ease both",
            opacity: 0,
          }}>
            {[
              { v: "30s", l: "por imóvel" },
              { v: "10×", l: "mais rápido" },
              { v: "6", l: "módulos IA" },
              { v: "100%", l: "automático" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <span style={{
                  display: "block",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "clamp(24px, 3vw, 34px)",
                  color: "#FFD700", lineHeight: 1
                }}>{s.v}</span>
                <span style={{
                  display: "block", marginTop: "6px",
                  fontSize: "11px", letterSpacing: "1.5px",
                  color: "rgba(255,255,255,0.35)", textTransform: "uppercase"
                }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VIDEO */}
        <div className="video-container" style={{
          position: "relative", zIndex: 10,
          width: "100%", marginTop: "-120px",
          animation: "fadeIn 1s 0.5s ease both", opacity: 0,
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "180px", zIndex: 3,
            background: "linear-gradient(to bottom, #010101 0%, transparent 100%)"
          }} />
          <video
            ref={videoRef}
            autoPlay loop muted playsInline
            onLoadedData={() => setVideoLoaded(true)}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260206_044704_dd33cb15-c23f-4cfc-aa09-a0465d4dcb54.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", zIndex: 3,
            background: "linear-gradient(to top, #010101 0%, transparent 100%)"
          }} />
        </div>

        {/* LOGO CLOUD */}
        <div style={{
          position: "relative", zIndex: 20,
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(8px)",
          padding: "20px 32px",
          display: "flex", alignItems: "center", gap: "28px",
          overflow: "hidden",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            whiteSpace: "nowrap", flexShrink: 0
          }}>
            Tecnologia por trás
          </span>
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
          <InfiniteSlider />
        </div>

      </section>
    </>
  );
}
