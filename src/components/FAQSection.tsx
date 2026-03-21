import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "O ImobCreator AI publica automaticamente?",
    answer:
      "O fluxo foi estruturado para gerar o criativo, preparar a legenda e manter aprovação antes da publicação. A automação pode evoluir conforme a operação e o plano.",
  },
  {
    question: "Serve para corretor autônomo e imobiliária?",
    answer:
      "Sim. A estrutura atende tanto operação individual quanto times maiores, com base para templates, múltiplos fluxos e evolução SaaS.",
  },
  {
    question: "Preciso de designer para usar?",
    answer:
      "Não para o fluxo principal. A proposta é reduzir o trabalho manual usando IA, templates e padronização visual.",
  },
  {
    question: "Posso adaptar a identidade da minha marca?",
    answer:
      "Sim. O sistema já trabalha com templates e brand kits, permitindo manter consistência visual na produção dos criativos.",
  },
  {
    question: "O que é o ImobCreatorVideo?",
    answer:
      "É uma plataforma que transforma suas fotos de imóveis em vídeos profissionais de forma automática, usando inteligência artificial.",
  },
  {
    question: "Preciso ter conhecimento em edição de vídeo?",
    answer:
      "Não! Nossa plataforma é totalmente automatizada. Você só precisa enviar as fotos e escolher o estilo desejado.",
  },
  {
    question: "Como funcionam os créditos?",
    answer:
      "Cada vídeo gerado consome 100 créditos (planos Standard e Plus) ou 200 créditos (plano Premium com qualidade 4K). Seus créditos são renovados a cada ciclo de cobrança.",
  },
  {
    question: "Os créditos acumulam?",
    answer:
      "Sim! Os créditos não utilizados permanecem na sua conta mesmo após o cancelamento da assinatura.",
  },
  {
    question: "Quanto tempo leva para gerar um vídeo?",
    answer:
      "Em média, um vídeo é gerado em 2 a 5 minutos, dependendo da quantidade de fotos e da duração escolhida.",
  },
  {
    question: "Posso editar o vídeo depois de pronto?",
    answer:
      "Atualmente não oferecemos edição pós-geração, mas você pode criar um novo vídeo com configurações diferentes quantas vezes quiser (dentro do seu saldo de créditos).",
  },
  {
    question: "Posso trocar de plano a qualquer momento?",
    answer:
      "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será calculado proporcionalmente ao período restante.",
  },
  {
    question: "Como funciona o plano anual?",
    answer:
      "No plano anual você paga 10 meses e ganha 2 meses grátis, economizando aproximadamente 17% em relação ao plano mensal. O valor é cobrado à vista e o acesso liberado imediatamente por 12 meses.",
  },
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-semibold text-foreground">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre o ImobCreator AI e os nossos planos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-14 max-w-xl mx-auto text-center">
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Ainda tem dúvidas?</h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para te ajudar a encontrar o plano ideal para a sua operação.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá!+Tenho+dúvidas+sobre+o+ImobCreator+AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent-gradient text-primary font-semibold px-6 py-3 rounded-xl shadow-glow hover:scale-105 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            Entre em contato
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
