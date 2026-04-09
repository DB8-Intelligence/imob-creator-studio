export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: '#002B5B' }}>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260206_044704_dd33cb15-c23f-4cfc-aa09-a0465d4dcb54.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay gradient — Navy brand */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,43,91,0.60) 0%, rgba(0,43,91,0.30) 50%, rgba(0,43,91,0.75) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 pt-32 md:pt-48 pb-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border"
          style={{ borderColor: 'rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.10)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FFD700' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FFD700', fontFamily: 'Rubik, sans-serif' }}>
            Plataforma IA Imobiliária
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="uppercase text-white font-bold text-6xl md:text-8xl lg:text-[100px] mb-10"
          style={{
            fontFamily: 'Rubik, sans-serif',
            lineHeight: '0.98',
            letterSpacing: '-3px',
          }}
        >
          <span className="block">NOVA ERA</span>
          <span className="block">DO <span style={{ color: '#FFD700' }}>DESIGN</span></span>
          <span className="block">IMOBILIÁRIO</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base md:text-lg mb-12 max-w-md"
          style={{
            fontFamily: 'Rubik, sans-serif',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: '1.6',
            letterSpacing: '0',
          }}
        >
          Transforme fotos em criativos profissionais, vídeos e posts para Instagram em segundos — sem designer, sem Canva.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-5 flex-wrap mb-20">

          {/* Primary CTA — SVG shape Gold */}
          <button
            className="relative transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none"
            style={{ width: '184px', height: '65px' }}
            onClick={() => window.location.href = '/auth'}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 184 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 0H178L184 10V55L178 65H6L0 55V10L6 0Z" fill="#FFD700" />
            </svg>
            <span
              className="relative z-10 flex items-center justify-center w-full h-full font-bold uppercase"
              style={{
                fontFamily: 'Rubik, sans-serif',
                fontSize: '14px',
                letterSpacing: '2px',
                color: '#002B5B',
              }}
            >
              COMEÇAR AGORA
            </span>
          </button>

          {/* Secondary CTA — outline */}
          <button
            className="flex items-center justify-center font-bold uppercase transition-all duration-150 hover:border-yellow-400 hover:text-yellow-400 focus:outline-none"
            style={{
              width: '184px',
              height: '65px',
              fontFamily: 'Rubik, sans-serif',
              fontSize: '13px',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.80)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: '4px',
              background: 'transparent',
            }}
            onClick={() => window.location.href = '/planos'}
          >
            VER PLANOS
          </button>
        </div>

        {/* Stats Row */}
        <div
          className="flex gap-10 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          {[
            { value: '30s', label: 'Por imóvel' },
            { value: '10×', label: 'Mais rápido' },
            { value: '6',   label: 'Módulos IA' },
          ].map((stat) => (
            <div key={stat.label}>
              <span
                className="block font-bold"
                style={{ fontFamily: 'Rubik, sans-serif', fontSize: '28px', color: '#FFD700', lineHeight: '1' }}
              >
                {stat.value}
              </span>
              <span
                className="block mt-1 uppercase"
                style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.50)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
