import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b14] via-[#0d0e18] to-[#0a0b14]" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative p-10 sm:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Comece em menos de 2 minutos
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pronto para transformar seus{" "}
                <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  imóveis em conteúdo
                </span>
                ?
              </h2>

              <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10">
                Cadastre-se, faça upload das fotos e comece a gerar vídeos, artes, staging virtual e muito mais com inteligência artificial.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  to="/auth"
                  className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-base px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Começar gratuitamente
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://wa.me/5571999733883?text=Olá!+Tenho+interesse+no+DB8+Intelligence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-white/70 hover:text-white font-medium text-base px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar com especialista
                </a>
              </div>

              <p className="text-white/30 text-sm">
                Sem contrato · Cancele quando quiser · Suporte por WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
