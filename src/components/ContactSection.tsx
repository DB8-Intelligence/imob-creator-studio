import { useState } from "react";
import { Mail, MessageCircle, Send, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./public/SectionHeader";
import { ProofBadge } from "./public/ProofBadge";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";
import { motion } from "framer-motion";

const contactItems = [
  {
    icon: MessageCircle,
    iconBg: "bg-[rgba(52,211,153,0.1)]",
    iconColor: "text-[#6EE7B7]",
    title: "WhatsApp",
    desc: "Atendimento rápido para dúvidas sobre planos e funcionalidades.",
    link: { href: "https://wa.me/5511999999999", label: "Chamar no WhatsApp →", color: "text-[#6EE7B7]" },
  },
  {
    icon: Mail,
    iconBg: "bg-[rgba(212,175,55,0.1)]",
    iconColor: "text-[var(--ds-gold-light)]",
    title: "E-mail",
    desc: "Para suporte técnico, parcerias e questões comerciais.",
    link: { href: "mailto:contato@db8intelligence.com.br", label: "contato@db8intelligence.com.br", color: "text-[var(--ds-gold-light)]" },
  },
  {
    icon: Clock,
    iconBg: "bg-[rgba(0,242,255,0.08)]",
    iconColor: "text-[var(--ds-cyan)]",
    title: "Horário de atendimento",
    desc: "Segunda a sexta, das 9h às 18h (horário de Brasília). Suporte técnico: atendimento por e-mail em até 24h.",
    link: null,
  },
  {
    icon: MapPin,
    iconBg: "bg-[rgba(167,139,250,0.1)]",
    iconColor: "text-[#C4B5FD]",
    title: "Base de operação",
    desc: "Brasil — atendemos corretores e imobiliárias em todo o território nacional.",
    link: null,
  },
];

const ContactSection = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contato DB8 Intelligence — ${form.nome}`);
    const body    = encodeURIComponent(`Nome: ${form.nome}\nE-mail: ${form.email}\n\nMensagem:\n${form.mensagem}`);
    window.open(`mailto:contato@db8intelligence.com.br?subject=${subject}&body=${body}`);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contatos" className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Contatos</ProofBadge>}
          title={<>Fale com a <span className="text-gold">nossa equipe</span></>}
          subtitle="Dúvidas sobre planos, integração ou suporte técnico? Estamos disponíveis para ajudar."
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8"
          >
            <h3 className="ds-h3 mb-6">Envie uma mensagem</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-[rgba(52,211,153,0.1)] flex items-center justify-center">
                  <Send className="w-6 h-6 text-[#6EE7B7]" />
                </div>
                <p className="text-[var(--ds-fg)] font-medium">Mensagem enviada!</p>
                <p className="ds-body text-sm text-center">Seu cliente de e-mail foi aberto. Retornamos em até 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {["Nome", "E-mail"].map((label) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-[var(--ds-fg)] mb-1.5">{label}</label>
                    <input
                      type={label === "E-mail" ? "email" : "text"}
                      required
                      value={label === "Nome" ? form.nome : form.email}
                      onChange={(e) =>
                        setForm(label === "Nome" ? { ...form, nome: e.target.value } : { ...form, email: e.target.value })
                      }
                      placeholder={label === "Nome" ? "Seu nome completo" : "seu@email.com"}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--ds-border-2)] bg-[rgba(255,255,255,0.03)] text-[var(--ds-fg)] text-sm placeholder:text-[var(--ds-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.3)]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-[var(--ds-fg)] mb-1.5">Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Como podemos ajudar?"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--ds-border-2)] bg-[rgba(255,255,255,0.03)] text-[var(--ds-fg)] text-sm placeholder:text-[var(--ds-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.3)] resize-none"
                  />
                </div>
                <Button type="submit" variant="default" size="lg" className="w-full group">
                  Enviar mensagem
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact items */}
          <StaggerChildren className="flex flex-col gap-4">
            {contactItems.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUpVariants}
                className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
              >
                <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--ds-fg)] mb-1">{item.title}</h4>
                  <p className="ds-body text-sm mb-1.5">{item.desc}</p>
                  {item.link && (
                    <a href={item.link.href} target="_blank" rel="noopener noreferrer" className={`${item.link.color} text-sm font-medium hover:underline`}>
                      {item.link.label}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
