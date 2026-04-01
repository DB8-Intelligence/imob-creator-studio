import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0f] to-[#07080c]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="container mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo + description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-display text-xl font-semibold text-white">
                DB8 <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Intelligence</span>
              </span>
            </div>
            <p className="text-white/40 max-w-md leading-relaxed text-sm">
              Plataforma completa de IA para o mercado imobiliário. Gere vídeos, artes, staging virtual, renders, demarcações e muito mais — tudo integrado em um único dashboard.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#criativos" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Serviços de IA</a></li>
              <li><a href="#como-funciona" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Como funciona</a></li>
              <li><a href="#planos" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Planos e Preços</a></li>
              <li><Link to="/auth" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Começar Agora</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Empresa</h4>
            <ul className="space-y-3">
              <li><a href="#contatos" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Contatos</a></li>
              <li><Link to="/auth" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Entrar</Link></li>
              <li><Link to="/termos" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Termos de Uso</Link></li>
              <li><Link to="/termos" className="text-white/40 hover:text-amber-400 transition-colors text-sm">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 DB8 Intelligence. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="text-white/30 hover:text-amber-400 text-sm transition-colors">
              Termos de Uso
            </Link>
            <Link to="/termos" className="text-white/30 hover:text-amber-400 text-sm transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
