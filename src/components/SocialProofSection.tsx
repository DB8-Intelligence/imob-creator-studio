import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Antes eu passava horas pedindo arte para o designer e esperando legenda. Agora o post sai em minutos direto pelo WhatsApp. Economizei pelo menos 6 horas por semana.",
    name: "Mariana Souza",
    role: "Corretora Autônoma",
    company: "CRECI-SP",
    initials: "MS",
  },
  {
    quote:
      "Implementamos o ImobCreator AI na nossa operação e triplicamos o volume de posts sem contratar mais ninguém. O fluxo de aprovação antes da publicação eliminou erros que antes constrangiam a equipe.",
    name: "Carlos Mendonça",
    role: "Diretor Comercial",
    company: "Imobiliária Prime",
    initials: "CM",
  },
  {
    quote:
      "A qualidade dos criativos parece agência. Nosso Instagram ficou com cara profissional do dia pra noite, com a nossa identidade visual aplicada em todos os posts.",
    name: "Ana Paula Ferreira",
    role: "Gerente de Marketing",
    company: "RE/MAX Regional",
    initials: "AP",
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Quem já usa <span className="text-gradient">não volta para o processo manual</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Corretores e imobiliárias que escalaram a produção de conteúdo com o ImobCreator AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft flex flex-col"
            >
              <Quote className="w-8 h-8 text-accent/40 mb-4 flex-shrink-0" />
              <p className="text-foreground/80 leading-relaxed flex-1 mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center flex-shrink-0">
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
