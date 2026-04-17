import { motion } from "framer-motion";
import { Check, ArrowRight, Smartphone, Bot, Zap, Gift, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ── Animations ──
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function SecretariaVirtualLpPage() {
  return (
    <div className="min-h-screen bg-[#050B14] font-sans selection:bg-[#FFD700] selection:text-[#0A1628]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FFD700] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl z-10">
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              🔴 Você está perdendo vendas agora mesmo
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-white leading-tight mt-6">
            Sua <span className="text-[#FFD700]">Secretária Virtual 24h</span> que atende, qualifica e agenda visitas enquanto você dorme.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-8 text-lg text-gray-400 max-w-2xl mx-auto">
            Cansado de pagar caro no lead e ele sumir no WhatsApp? A NexoAI atende 100% dos seus contatos em menos de 5 segundos.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#oferta" className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] font-black text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105">
              QUERO MINHA SECRETÁRIA IA <ArrowRight size={20} />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Dores (Pain) Section */}
      <section className="py-20 px-4 bg-[#0A1628]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              O erro nas vendas não está na captação...
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Está na falta de organização e resposta consistente. O cliente da internet não espera. 
              Mandar um "Bom dia, já falo com você" e sumir por 2 horas significa <span className="text-red-400 font-bold">dinheiro rasgado</span>.
            </p>
            <ul className="space-y-4">
              {[
                "Tráfego pago ficando cada vez mais caro",
                "Leads frios ignorando suas mensagens",
                "Você sem tempo para focar em mostrar o imóvel",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <X size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#050B14] p-8 rounded-2xl border border-gray-800 shadow-2xl relative">
            <div className="absolute -top-4 -right-4 bg-[#FFD700] text-[#0A1628] text-xs font-black px-3 py-1 rounded w-fit transform rotate-3">
              A SOLUÇÃO ↓
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                  <Bot size={20} />
                </div>
                <div className="bg-gray-800 p-4 rounded-xl rounded-tl-none">
                  <p className="text-sm text-gray-200">Olá! Vi que você tem interesse no lançamento do Acqua Coast. Você busca para morar ou investir?</p>
                </div>
              </div>
              <div className="flex gap-4 items-start flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white shrink-0">
                  🧑
                </div>
                <div className="bg-[#FFD700] p-4 rounded-xl rounded-tr-none">
                  <p className="text-sm text-[#0A1628] font-medium">Investir. Mas só se a rentabilidade compensar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Offer */}
      <section id="oferta" className="py-24 px-4 bg-[#050B14]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* Main Plan Card */}
          <div className="flex-1 bg-[#0A1628] border-2 border-[#FFD700] rounded-3xl p-8 relative shadow-[0_0_40px_rgba(255,215,0,0.1)]">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#0A1628] font-black text-xs px-6 py-2 rounded-full uppercase tracking-wider">
              OFERTA SMART ANUAL
            </span>
            
            <h3 className="text-3xl font-extrabold text-white text-center mt-6">IA DO CORRETOR</h3>
            
            <div className="mt-8 text-center">
              <span className="text-[#FFD700] font-black text-2xl mr-1">12x</span>
              <span className="text-white font-black text-6xl tracking-tighter">R$ 51,40</span>
            </div>
            
            <ul className="mt-10 space-y-4">
              {[
                "Secretária virtual rodando 24 horas",
                "IA que entende áudios e textos do cliente",
                "Respostas baseadas nos SEUS imóveis",
                "Agendamento direto na sua agenda",
                "BÔNUS: Acesso Vitalício",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                  <Check size={20} className="text-[#FFD700] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            
            <button className="mt-10 w-full bg-[#FFD700] hover:bg-[#F2C900] text-[#0A1628] font-black text-xl py-5 rounded-xl transition-all shadow-[0_10px_20px_rgba(255,215,0,0.2)]">
              QUERO ASSINAR AGORA
            </button>
          </div>

          {/* Bonuses Column */}
          <div className="w-full md:w-[320px] flex flex-col gap-4">
            <div className="bg-[#0A1628] border border-gray-800 rounded-2xl p-6 h-full flex flex-col justify-center">
              <Gift size={32} className="text-[#FFD700] mb-4" />
              <h4 className="text-white font-bold text-lg mb-2">🎁 Bônus 1: Masterclass de Tráfego Imobiliário</h4>
              <p className="text-gray-400 text-sm">O mesmo tráfego que ensino para corretoras de alto padrão. Crie anúncios que trazem o cliente certo para a sua nova IA atender.</p>
              <div className="mt-4 text-sm font-semibold text-gray-500 line-through">De R$ 297,00</div>
              <div className="text-sm font-bold text-[#FFD700]">GRÁTIS HOJE</div>
            </div>
            <div className="bg-[#0A1628] border border-gray-800 rounded-2xl p-6 h-full flex flex-col justify-center">
              <Zap size={32} className="text-[#FFD700] mb-4" />
              <h4 className="text-white font-bold text-lg mb-2">🎁 Bônus 2: Pack Canva Imóveis</h4>
              <p className="text-gray-400 text-sm">Templates profissionais e editáveis para você não perder tempo criando artes do zero.</p>
              <div className="mt-4 text-sm font-semibold text-gray-500 line-through">De R$ 97,00</div>
              <div className="text-sm font-bold text-[#FFD700]">GRÁTIS HOJE</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-[#0A1628]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12 uppercase tracking-wide">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              { q: "É fácil de usar?", a: "Extremamente simples. Basta escanear o QR Code no seu painel, definir o tom de voz da IA e começar a usar as respostas automáticas." },
              { q: "Meu computador precisa ficar ligado?", a: "Não! A nossa integração roda na nuvem 24h por dia. Você não precisa de computador ligado 100% do tempo." },
              { q: "Preciso pagar taxa extra por lead?", a: "Não. Diferente de outras plataformas, você tem um uso alto de mensagens antes de se preocupar com custos extras de limites." },
            ].map((faq, i) => (
              <div key={i} className="bg-[#050B14] border border-[#FFD700]/30 rounded-xl p-6">
                <h4 className="flex gap-3 text-[#FFD700] font-bold text-lg">
                  <span className="text-orange-500">+</span> {faq.q}
                </h4>
                <p className="pt-3 text-gray-400 text-sm pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
