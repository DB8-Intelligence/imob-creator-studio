const proofs = [
  {
    title: "Fluxo mais previsível",
    description: "Centralize recebimento, geração, aprovação e publicação em uma operação única.",
  },
  {
    title: "Menos retrabalho manual",
    description: "Reduza a dependência de processos soltos entre WhatsApp, designer, legenda e publicação.",
  },
  {
    title: "Escala para corretor ou imobiliária",
    description: "Padronize a marca e prepare a base para crescimento, templates e evolução multi-tenant.",
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Prova de valor
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Mais do que arte: <span className="text-gradient">uma operação de conteúdo imobiliário</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            O ImobCreator AI foi desenhado para diminuir gargalos, padronizar criativos e acelerar a publicação com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {proofs.map((proof) => (
            <div key={proof.title} className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{proof.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{proof.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
