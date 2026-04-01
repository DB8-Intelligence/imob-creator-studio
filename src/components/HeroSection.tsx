import { ArrowRight, Play, Video, Sofa, MapPin, Sparkles, Image, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Image, label: "Criativos com IA", color: "from-amber-400 to-orange-500" },
  { icon: Video, label: "V\u00eddeos Cinem\u00e1ticos", color: "from-blue-400 to-indigo-500" },
  { icon: Sofa, label: "Mobiliar Ambientes", color: "from-emerald-400 to-teal-500" },
  { icon: MapPin, label: "Demarcar Terrenos", color: "from-rose-400 to-pink-500" },
  { icon: PenTool, label: "Render de Esbo\u00e7os", color: "from-violet-400 to-purple-500" },
  { icon: Sparkles, label: "Reformar Im\u00f3veis", color: "from-cyan-400 to-blue-500" },
];

const stats = [
  { value: "< 5 min", label: "para gerar criativo e v\u00eddeo" },
  { value: "8 servi\u00e7os", label: "de IA imobili\u00e1ria integrados" },
  { value: "100% IA", label: "Gemini + Veo 3.1" },
  { value: "4 planos", label: "do starter ao premium" },
];

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen pt-20 overflow-hidden bg-[#07080c]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b14] via-[#07080c] to-[#0d0e18]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-500/8 via-amber-500/3 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Badge */}
        <div className="opacity-0 animate-fade-up mb-6">
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-semibold">Novo</span>
            </span>
            Plataforma completa de IA para o mercado imobili\u00e1rio
          </span>
        </div>

        {/* Main headline */}
        <h1 className="opacity-0 animate-fade-up animation-delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl leading-[1.1] mb-6 tracking-tight">
          Transforme im\u00f3veis em{" "}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            conte\u00fado que vende
          </span>
          {" "}com IA
        </h1>

        {/* Subtitle */}
        <p className="opacity-0 animate-fade-up animation-delay-200 text-lg sm:text-xl text-white/50 max-w-3xl mb-8 leading-relaxed">
          Gere v\u00eddeos cinem\u00e1ticos, mobile ambientes, crie artes profissionais, demarque terrenos e muito mais \u2014 tudo em uma \u00fanica plataforma com Gemini e Veo 3.1.
        </p>

        {/* CTA Buttons */}
        <div className="opacity-0 animate-fade-up animation-delay-300 flex flex-col sm:flex-row items-center gap-4 mb-14">
          <Link
            to="/auth"
            className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-base px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300"
          >
            Comec\u0327ar agora
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#como-funciona"
            className="group inline-flex items-center gap-2.5 text-white/70 hover:text-white font-medium text-base px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            Ver demonstra\u00e7\u00e3o
          </a>
        </div>

        {/* Service pills */}
        <div className="opacity-0 animate-fade-up animation-delay-400 flex flex-wrap items-center justify-center gap-3 mb-16">
          {services.map((s) => (
            <div
              key={s.label}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-default"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                <s.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/80 font-medium transition-colors">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="opacity-0 animate-fade-up animation-delay-500 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-4xl">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
            >
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
