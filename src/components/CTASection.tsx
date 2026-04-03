import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CTABanner } from "./public/CTABanner";
import { ProofBadge } from "./public/ProofBadge";

const CTASection = () => {
  return (
    <CTABanner
      badge={
        <ProofBadge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Comece em menos de 2 minutos
        </ProofBadge>
      }
      title={
        <>
          Pronto para transformar seus{" "}
          <span className="text-gold">imóveis em conteúdo</span>?
        </>
      }
      subtitle="Cadastre-se, faça upload das fotos e comece a gerar vídeos, artes, staging virtual e muito mais com inteligência artificial."
      primaryCta={
        <Link to="/auth" className="btn-primary group">
          Começar gratuitamente
          <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
        </Link>
      }
      secondaryCta={
        <a
          href="https://wa.me/5571999733883?text=Olá!+Tenho+interesse+no+DB8+Intelligence"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <MessageCircle className="w-4.5 h-4.5" />
          Falar com especialista
        </a>
      }
    />
  );
};

export default CTASection;
