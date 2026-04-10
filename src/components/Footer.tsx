import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const subscribe = () => {
    if (!email) return;
    const list = JSON.parse(localStorage.getItem("newsletter_emails") || "[]");
    list.push({ email, date: new Date().toISOString() });
    localStorage.setItem("newsletter_emails", JSON.stringify(list));
    toast.success("Inscrito com sucesso!");
    setEmail("");
  };

  return (
    <footer className="bg-[#0A1628]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo + desc */}
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-xl font-bold text-white" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-5">
              Plataforma completa de marketing imobiliário com IA. Criativos, vídeos, site, CRM e WhatsApp integrados.
            </p>
            <div className="flex items-center gap-3">
              {["IG", "FB", "IN"].map((s) => (
                <span key={s} className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#94A3B8] text-xs font-bold hover:bg-[rgba(255,215,0,0.15)] hover:text-[#FFD700] transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>

          {/* Soluções */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Soluções</h4>
            <ul className="space-y-3">
              {[
                { label: "Criativos", href: "/criativos" },
                { label: "Vídeos", href: "/videos" },
                { label: "Site + Portais", href: "/site-imobiliario" },
                { label: "CRM", href: "/crm-imobiliario" },
                { label: "WhatsApp", href: "/whatsapp-imobiliario" },
                { label: "Social", href: "/publicacao-social" },
              ].map((l) => (
                <li key={l.href}><Link to={l.href} className="text-[#94A3B8] hover:text-[#FFD700] transition-colors text-sm">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Empresa</h4>
            <ul className="space-y-3">
              {[
                { label: "Sobre", href: "/sobre" },
                { label: "Preços", href: "/precos" },
                { label: "Contato", href: "/contato" },
                { label: "Termos de Uso", href: "/termos" },
              ].map((l) => (
                <li key={l.href}><Link to={l.href} className="text-[#94A3B8] hover:text-[#FFD700] transition-colors text-sm">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Newsletter</h4>
            <p className="text-[#94A3B8] text-sm mb-4">Receba dicas de marketing imobiliário com IA.</p>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" className="flex-1 px-3 py-2.5 rounded-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white text-sm outline-none focus:border-[#FFD700] placeholder:text-[#64748B]" onKeyDown={(e) => e.key === "Enter" && subscribe()} />
              <button type="button" onClick={subscribe} className="px-4 py-2.5 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-xs rounded-[8px] transition-colors whitespace-nowrap">Inscrever</button>
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.08)] mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#64748B] text-xs">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <span>&copy; 2026 NexoImob AI. Todos os direitos reservados.</span>
            <span className="hidden md:inline">·</span>
            <span>DB8 INTERPRICE COMERCIO E SERVICOS LTDA · CNPJ 31.982.768/0001-31</span>
          </div>
          <div className="flex gap-5">
            <Link to="/termos" className="hover:text-[#FFD700] transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-[#FFD700] transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
