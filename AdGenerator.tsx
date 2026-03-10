import React, { useState } from 'react';
import { Sparkles, Copy, Check, MessageCircle, Instagram, Globe } from 'lucide-react';

const AdGenerator = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [ads, setAds] = useState<{ type: string; text: string; icon: any }[]>([]);

  const generateAds = async () => {
    setLoading(true);
    // Simulação da chamada de API do Gemini no AI Studio
    // Em um ambiente real, você conectaria aqui com a sua chave de API
    setTimeout(() => {
      const mockAds = [
        {
          type: 'Instagram',
          icon: Instagram,
          text: `🏠 OPORTUNIDADE ÚNICA! \n\n${description.slice(0, 50)}... e muito mais! \n\n✨ Acabamento de alto padrão\n📍 Localização privilegiada\n🚀 Agende sua visita agora! #Imoveis #Luxo #Corretor`
        },
        {
          type: 'Portal Imobiliário',
          icon: Globe,
          text: `Excelente imóvel disponível para venda. Apresenta as seguintes características: ${description}. Ideal para quem busca conforto e segurança. Entre em contato para ficha técnica completa.`
        },
        {
          type: 'WhatsApp Rápido',
          icon: MessageCircle,
          text: `Oi! Tudo bem? Acabou de entrar uma unidade com essas características: ${description}. Lembrei de você! Quer que eu te mande as fotos e o valor?`
        }
      ];
      setAds(mockAds);
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-blue-600 w-5 h-5" />
          <h2 className="text-xl font-semibold text-slate-800">Gerador de Anúncios Magnéticos</h2>
        </div>
        
        <textarea
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          rows={4}
          placeholder="Ex: Apartamento 3 quartos, suíte, varanda gourmet, 2 vagas, no bairro Pituba, Salvador..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={generateAds}
          disabled={loading || !description}
          className={`mt-4 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            loading || !description ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          }`}
        >
          {loading ? 'Criando textos...' : 'Gerar Anúncios com IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ads.map((ad, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-3 text-blue-600">
                <ad.icon size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">{ad.type}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {ad.text}
              </p>
            </div>
            
            <button
              onClick={() => copyToClipboard(ad.text, index)}
              className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded-md transition-colors border border-blue-100"
            >
              {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
              {copiedIndex === index ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdGenerator;
