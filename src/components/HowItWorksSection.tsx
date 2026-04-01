import { Upload, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Envie a imagem ou a ideia",
    description: "Suba fotos do imóvel, esboço do terreno, ou comece com um conceito simples. A plataforma aceita qualquer ponto de partida.",
    color: "from-amber-400 to-orange-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "A IA gera o resultado",
    description: "Escolha o serviço — vídeo, staging, render, demarcação — e a IA entrega o resultado profissional em segundos.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Baixe, publique ou refine",
    description: "Faça download, compare antes/depois, organize na biblioteca e publique direto nas redes sociais.",
    color: "from-emerald-400 to-teal-500",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
            Como funciona
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Do upload ao resultado em{" "}
            <span className="text-gradient">três passos</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simples como deve ser. Envie, escolha o serviço e pronto.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="bg-card rounded-2xl p-8 border border-border/40 hover:border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
                  {/* Number badge */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6`}>
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-5 mx-auto">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between cards */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-24 -right-4 w-8 h-8 items-center justify-center text-accent/30 z-10">
                    <ArrowRight className="w-5 h-5" />
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
