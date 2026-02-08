import { allMockups } from "@/data/templateMockups";

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

        {allMockups.map((group) => (
          <div key={group.format} className="mb-12 last:mb-0">
            <h3 className="text-xl font-display font-semibold text-foreground mb-6 text-center">
              {group.format}
            </h3>
            <div className="flex justify-center gap-6 flex-wrap">
              {group.mockups.map((mockup) => (
                <div key={mockup.label} className="group">
                  <div className="relative overflow-hidden rounded-xl">
                    <div className={`${group.format === "Feed" ? "w-[260px]" : "w-[180px]"}`}>
                      <img
                        src={mockup.src}
                        alt={mockup.label}
                        className={`w-full ${group.format === "Feed" ? "aspect-square" : "aspect-[9/16]"} object-cover rounded-xl`}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                      <button className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors">
                        Usar Template
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h4 className="font-display font-semibold text-foreground text-sm">{mockup.label}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TemplatesSection;
