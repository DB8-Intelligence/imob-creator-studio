import { Upload, Palette, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Receba o imóvel",
    description: "Centralize fotos e dados do imóvel no sistema para iniciar a produção com mais velocidade.",
  },
  {
    number: "02",
    icon: Palette,
    title: "IA monta o criativo",
    description: "Aplique template, gere legenda com CTA e prepare a peça para aprovação sem retrabalho manual.",
  },
  {
    number: "03",
    icon: Download,
    title: "Aprove e publique",
    description: "Revise o conteúdo e publique no Instagram com um fluxo mais previsível e escalável.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Três passos simples para{" "}
            <span className="text-gradient">resultados incríveis</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Nosso processo foi desenhado para ser rápido e intuitivo, 
            para que você possa focar no que importa: vender.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 text-center lg:text-left">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gradient shadow-glow mb-6">
                    <span className="font-display text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto lg:mx-0">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-12 -translate-y-1/2 text-accent/30">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
