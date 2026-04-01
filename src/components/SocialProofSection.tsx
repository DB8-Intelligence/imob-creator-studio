import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Antes eu passava horas pedindo arte para o designer e esperando legenda. Agora o post sai em minutos direto pelo dashboard. Economizei pelo menos 6 horas por semana.",
    name: "Mariana Souza",
    role: "Corretora Autônoma",
    company: "CRECI-SP",
    initials: "MS",
    rating: 5,
  },
  {
    quote:
      "Implementamos o DB8 Intelligence na nossa operação e triplicamos o volume de posts sem contratar mais ninguém. Os vídeos cinematográficos impressionam os clientes.",
    name: "Carlos Mendonça",
    role: "Diretor Comercial",
    company: "Imobiliária Prime",
    initials: "CM",
    rating: 5,
  },
  {
    quote:
      "O staging virtual mudou nosso jogo. Mostrar o apartamento mobiliado antes do cliente visitar aumentou nossas conversões em 40%. A IA é impressionante.",
    name: "Ana Paula Ferreira",
    role: "Gerente de Marketing",
    company: "RE/MAX Regional",
    initials: "AP",
    rating: 5,
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Quem já usa{" "}
            <span className="text-gradient">não volta ao processo manual</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Corretores e imobiliárias que escalaram a produção de conteúdo com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-border/40 bg-card p-7 hover:border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <Quote className="w-7 h-7 text-accent/30 mb-3 shrink-0" />
              <p className="text-foreground/80 leading-relaxed flex-1 mb-6 text-sm italic">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
