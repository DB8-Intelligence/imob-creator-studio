const faqs = [
  {
    question: "O ImobCreator AI publica automaticamente?",
    answer: "O fluxo foi estruturado para gerar o criativo, preparar a legenda e manter aprovação antes da publicação. A automação pode evoluir conforme a operação e o plano.",
  },
  {
    question: "Serve para corretor autônomo e imobiliária?",
    answer: "Sim. A estrutura atende tanto operação individual quanto times maiores, com base para templates, múltiplos fluxos e evolução SaaS.",
  },
  {
    question: "Preciso de designer para usar?",
    answer: "Não para o fluxo principal. A proposta é reduzir o trabalho manual usando IA, templates e padronização visual.",
  },
  {
    question: "Posso adaptar a identidade da minha marca?",
    answer: "Sim. O sistema já trabalha com templates e brand kits, permitindo manter consistência visual na produção dos criativos.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Dúvidas comuns antes de entrar no fluxo
          </h2>
          <p className="text-muted-foreground text-lg">
            Respostas rápidas para entender como o produto se encaixa na sua operação imobiliária.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
