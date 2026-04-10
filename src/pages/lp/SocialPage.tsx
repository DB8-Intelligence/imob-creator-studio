import { useState, useRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>{children}</motion.div>;
}

export default function SocialPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => { if (email) { const list = JSON.parse(localStorage.getItem("waitlist_social") || "[]"); list.push(email); localStorage.setItem("waitlist_social", JSON.stringify(list)); setSubmitted(true); } };

  return (
    <div className="min-h-screen bg-white text-[#374151]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#F0F0F0]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="shrink-0"><span className="text-xl font-bold text-[#002B5B]" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span></Link>
          <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#002B5B] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px]">Ver produtos disponíveis</Link>
        </div>
      </header>

      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#EEF2FF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <motion.div variants={fadeUp}><span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">📣 Publicação Social · Em breve</span></motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[#0A1628] leading-[1.1] tracking-tight">Publique automaticamente no Instagram e Facebook sem sair do ImobCreator</motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-lg">Agende, publique e acompanhe o desempenho dos seus posts.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full max-w-md">
              {!submitted ? (<>
                <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B] w-full" />
                <button type="button" onClick={handleSubmit} className="bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-6 py-3 rounded-[10px] transition-colors whitespace-nowrap">Quero ser avisado</button>
              </>) : (
                <div className="bg-[#ECFDF5] text-[#059669] font-semibold text-sm px-6 py-3 rounded-[10px] w-full text-center">Pronto! Você será avisado quando lançarmos.</div>
              )}
            </motion.div>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-xs">512 corretores aguardando</motion.p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-2xl font-extrabold text-[#0A1628]">O que está vindo</motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "📅", title: "Agendamento inteligente", desc: "No melhor horário para engajamento." },
              { emoji: "📊", title: "Analytics por imóvel", desc: "Alcance e engajamento detalhados." },
              { emoji: "🔁", title: "Publicação simultânea", desc: "Instagram + Facebook de uma vez." },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-dashed border-[#CBD5E1] p-7 text-center opacity-80">
                <span className="text-3xl mb-3 block">{f.emoji}</span>
                <h3 className="text-[#0A1628] font-bold text-base mb-1">{f.title}</h3>
                <p className="text-[#6B7280] text-sm">{f.desc}</p>
                <span className="inline-block mt-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280]">Em desenvolvimento</span>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#002B5B]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5">Enquanto isso, comece com Criativos ou Vídeos</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px]">Criativos <ArrowRight size={15} /></Link>
            <Link to="/videos" className="inline-flex items-center gap-2 bg-transparent text-white font-bold text-sm px-6 py-3 rounded-[10px] border border-white/30 hover:border-white/60">Vídeos <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-[#E5E7EB] bg-white">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#6B7280] text-xs">
          <span>&copy; 2026 NexoImob AI.</span>
          <Link to="/termos" className="hover:text-[#002B5B]">Termos</Link>
        </div>
      </footer>
    </div>
  );
}
