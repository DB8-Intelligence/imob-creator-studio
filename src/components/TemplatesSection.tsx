import SquarePostTemplate from "./templates/SquarePostTemplate";

const TemplatesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Templates
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Criativos Prontos para Usar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Templates profissionais otimizados para redes sociais. Personalize com seus imóveis em segundos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Template Preview Card */}
          <div className="group">
            <div className="relative overflow-hidden rounded-xl">
              <div className="max-w-[320px] mx-auto">
                <SquarePostTemplate />
              </div>
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                <button className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors">
                  Usar Template
                </button>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h4 className="font-display font-semibold text-foreground">Post Quadrado</h4>
              <p className="text-sm text-muted-foreground">1080 × 1080px · Instagram/Facebook</p>
            </div>
          </div>

          {/* Placeholder for more templates */}
          <div className="group">
            <div className="relative overflow-hidden rounded-xl bg-card border border-dashed border-border aspect-square flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">📐</span>
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">Stories</h4>
                <p className="text-sm text-muted-foreground">1080 × 1920px</p>
                <span className="inline-block mt-3 text-xs text-accent font-medium">Em breve</span>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="relative overflow-hidden rounded-xl bg-card border border-dashed border-border aspect-square flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">Carrossel</h4>
                <p className="text-sm text-muted-foreground">Múltiplas imagens</p>
                <span className="inline-block mt-3 text-xs text-accent font-medium">Em breve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
