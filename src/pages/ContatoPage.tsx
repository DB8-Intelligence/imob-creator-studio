import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", assunto: "", mensagem: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) return;
    const msgs = JSON.parse(localStorage.getItem("contact_messages") || "[]");
    msgs.push({ ...form, date: new Date().toISOString() });
    localStorage.setItem("contact_messages", JSON.stringify(msgs));
    toast.success("Mensagem enviada! Em breve entraremos em contato.");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB] mb-4">✉️ Contato</span>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-[#0A1628] leading-tight mb-4">Fale conosco</h1>
          <p className="text-[#6B7280] text-base">Tire suas dúvidas ou envie uma mensagem. Respondemos em até 2 horas.</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            {sent ? (
              <div className="bg-[#ECFDF5] rounded-2xl p-8 text-center">
                <span className="text-4xl mb-3 block">✅</span>
                <h3 className="text-xl font-bold text-[#0A1628] mb-2">Mensagem enviada!</h3>
                <p className="text-[#6B7280] text-sm">Em breve entraremos em contato.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1 block">Nome *</label>
                  <input type="text" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#0A1628] mb-1 block">E-mail *</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0A1628] mb-1 block">Telefone</label>
                    <input type="tel" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B]" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1 block">Assunto</label>
                  <select value={form.assunto} onChange={e => setForm(f => ({ ...f, assunto: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B] bg-white">
                    <option value="">Selecione...</option>
                    <option value="duvidas">Dúvidas sobre a plataforma</option>
                    <option value="planos">Planos e preços</option>
                    <option value="suporte">Suporte técnico</option>
                    <option value="parcerias">Parcerias</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1 block">Mensagem *</label>
                  <textarea required rows={5} value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B] resize-none" />
                </div>
                <button type="submit" className="w-full bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm py-3 rounded-[10px] transition-colors">Enviar mensagem</button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#F8FAFF] rounded-2xl border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-[#0A1628] mb-4">Informações de contato</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📱</span>
                  <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">WhatsApp</dt><dd className="text-[#0A1628] font-medium">(71) 9973-3542</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">✉️</span>
                  <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">E-mail</dt><dd className="text-[#0A1628] font-medium">suporte@nexoimobai.com.br</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div><dt className="text-[#6B7280] text-xs uppercase tracking-wider">Endereço</dt><dd className="text-[#0A1628] font-medium">Al dos Umbuzeiros, 531 · Sala 10<br />Salvador, BA</dd></div>
                </div>
              </dl>
            </div>

            <div className="bg-[#F1F5F9] rounded-2xl border border-[#E5E7EB] flex items-center justify-center min-h-[200px]">
              <a href="https://maps.google.com/?q=Alameda+dos+Umbuzeiros+531+Salvador+BA" target="_blank" rel="noopener noreferrer" className="text-[#002B5B] font-semibold text-sm hover:underline">
                📍 Ver no Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
