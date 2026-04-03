import { MessageCircle } from "lucide-react";
import { SectionHeader } from "./public/SectionHeader";
import { FAQItem } from "./public/FAQItem";
import { ProofBadge } from "./public/ProofBadge";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "O DB8 Intelligence publica automaticamente?",
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
  {
    question: "Como funcionam os créditos?",
    answer: "Cada vídeo gerado consome 100 créditos (planos Standard e Plus) ou 200 créditos (plano Premium com qualidade 4K). Seus créditos são renovados a cada ciclo de cobrança.",
  },
  {
    question: "Os créditos acumulam?",
    answer: "Sim! Os créditos não utilizados permanecem na sua conta mesmo após o cancelamento da assinatura.",
  },
  {
    question: "Quanto tempo leva para gerar um vídeo?",
    answer: "Em média, um vídeo é gerado em 2 a 5 minutos, dependendo da quantidade de fotos e da duração escolhida.",
  },
  {
    question: "Posso trocar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será calculado proporcionalmente ao período restante.",
  },
  {
    question: "Como funciona o plano anual?",
    answer: "No plano anual você paga 10 meses e ganha 2 meses grátis, economizando aproximadamente 17% em relação ao plano mensal. O valor é cobrado à vista e o acesso liberado imediatamente por 12 meses.",
  },
];

const FAQSection = () => {
  return (
    <section className="section-py section-px bg-section-dark relative">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">FAQ</ProofBadge>}
          title="Perguntas frequentes"
          subtitle="Tire suas dúvidas sobre o DB8 Intelligence e os nossos planos."
          className="mb-14"
        />

        <StaggerChildren className="max-w-4xl mx-auto flex flex-col gap-3">
          {faqs.map((faq) => (
            <motion.div key={faq.question} variants={fadeUpVariants}>
              <FAQItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </StaggerChildren>

        {/* Still have questions */}
        <div className="mt-14 max-w-xl mx-auto text-center">
          <h3 className="ds-h3 mb-2">Ainda tem dúvidas?</h3>
          <p className="ds-body mb-6">Nossa equipe está pronta para te ajudar a encontrar o plano ideal para a sua operação.</p>
          <a
            href="https://wa.me/5571999733883?text=Olá!+Tenho+dúvidas+sobre+o+DB8+Intelligence"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            Entre em contato
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
