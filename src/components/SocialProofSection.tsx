import { SectionHeader } from "./public/SectionHeader";
import { TestimonialCard } from "./public/TestimonialCard";
import { StaggerChildren } from "./public/Animations";
import { ProofBadge } from "./public/ProofBadge";

const testimonials = [
  {
    quote: "Antes eu passava horas pedindo arte para o designer e esperando legenda. Agora o post sai em minutos direto pelo dashboard. Economizei pelo menos 6 horas por semana.",
    author: "Mariana Souza",
    role: "Corretora Autônoma",
    company: "CRECI-SP",
    rating: 5,
  },
  {
    quote: "Implementamos o DB8 Intelligence na nossa operação e triplicamos o volume de posts sem contratar mais ninguém. Os vídeos cinematográficos impressionam os clientes.",
    author: "Carlos Mendonça",
    role: "Diretor Comercial",
    company: "Imobiliária Prime",
    rating: 5,
  },
  {
    quote: "O staging virtual mudou nosso jogo. Mostrar o apartamento mobiliado antes do cliente visitar aumentou nossas conversões em 40%. A IA é impressionante.",
    author: "Ana Paula Ferreira",
    role: "Gerente de Marketing",
    company: "RE/MAX Regional",
    rating: 5,
  },
];

const SocialProofSection = () => {
  return (
    <section className="section-py section-px bg-section-ocean relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Depoimentos</ProofBadge>}
          title={<>Quem já usa <span className="text-gold">não volta ao processo manual</span></>}
          subtitle="Corretores e imobiliárias que escalaram a produção de conteúdo com IA."
          className="mb-14"
        />

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.author}
              quote={t.quote}
              author={t.author}
              role={t.role}
              company={t.company}
              rating={t.rating}
            />
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default SocialProofSection;
