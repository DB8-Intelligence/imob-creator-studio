/**
 * useAgentChat.ts — Hook para chat interativo com agentes de IA
 *
 * Funcionalidades:
 * - Envio de mensagem + resposta simulada (mock) / real (n8n/Claude)
 * - Memória persistente por agente (localStorage)
 * - Histórico de conversas
 * - Loading state
 *
 * Quando a API estiver pronta, trocar sendMessage por POST ao n8n webhook.
 */
import { useState, useCallback, useEffect } from "react";
import { getInteractiveAgent } from "@/config/interactive-agents";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AgentMemory {
  agentId: string;
  facts: string[];
  lastInteraction: string;
}

const STORAGE_PREFIX = "imob_agent_chat_";
const MEMORY_PREFIX = "imob_agent_memory_";

function loadMessages(agentId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${agentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(agentId: string, messages: ChatMessage[]) {
  // Keep last 50 messages per agent
  const trimmed = messages.slice(-50);
  localStorage.setItem(`${STORAGE_PREFIX}${agentId}`, JSON.stringify(trimmed));
}

function loadMemory(agentId: string): AgentMemory {
  try {
    const raw = localStorage.getItem(`${MEMORY_PREFIX}${agentId}`);
    return raw ? JSON.parse(raw) : { agentId, facts: [], lastInteraction: "" };
  } catch {
    return { agentId, facts: [], lastInteraction: "" };
  }
}

function saveMemory(agentId: string, memory: AgentMemory) {
  localStorage.setItem(`${MEMORY_PREFIX}${agentId}`, JSON.stringify(memory));
}

/** Extract potential facts from user message for memory */
function extractFacts(message: string): string[] {
  const facts: string[] = [];
  // Simple heuristics — a real implementation would use the LLM
  const patterns = [
    /(?:faturo|faturamento|ganho|recebo)\s+(?:cerca de\s+)?R?\$?\s*[\d.,]+/i,
    /(?:sou|trabalho como|atuo como)\s+.{5,40}/i,
    /(?:meu|minha)\s+(?:região|bairro|cidade|área)\s+(?:é|fica)\s+.{3,30}/i,
    /(?:tenho|possuo)\s+\d+\s+(?:imóveis|clientes|leads|anos)/i,
    /(?:MEI|ME|LTDA|Simples|Lucro Presumido)/i,
    /(?:CRECI|CRC)\s*\d+/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) facts.push(m[0].trim());
  }
  return facts;
}

// ─── Mock response generation ──────────────────────────────────────────────

async function generateMockResponse(
  agentId: string,
  userMessage: string,
  memory: AgentMemory,
): Promise<string> {
  // Simulate API latency
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));

  const agent = getInteractiveAgent(agentId);
  if (!agent) return "Desculpe, não consegui processar sua mensagem.";

  // Context-aware mock responses per agent type
  const responses: Record<string, string[]> = {
    atendente_agendador: [
      `Entendi a situação. Sugiro responder assim:\n\n"Olá! Obrigado pelo interesse 😊 Esse imóvel está disponível sim! Posso te contar mais detalhes. Quando seria um bom horário para conversarmos?"\n\nIsso mantém o lead engajado sem dar informação demais de cara.`,
      `Para agendar, sugiro essa mensagem:\n\n"Oi [nome]! Confirmando nossa visita:\n📅 Sábado, 10h\n📍 [endereço]\n\nQualquer coisa, pode me chamar aqui! Até lá 🏠"\n\nSimples, direto e profissional.`,
      `Boa pergunta! Para leads que perguntam preço direto, a melhor abordagem é:\n\n1. Confirme o interesse: "Ótimo gosto! Esse é um dos mais procurados"\n2. Dê uma faixa: "Valores a partir de R$X"\n3. Abra a conversa: "Posso te mostrar as condições? Quando é melhor?"`,
    ],
    consultor_financeiro: [
      `Sobre comissão, o padrão do mercado imobiliário brasileiro é:\n\n• **Venda**: 5% a 6% do valor do imóvel\n• **Aluguel**: 1 aluguel (primeiro mês)\n• **Lançamentos**: 3% a 5% (varia por construtora)\n\n${memory.facts.length > 0 ? `Considerando o que você me contou (${memory.facts[0]}), sugiro...` : "Me conta seu faturamento médio que eu contextualizo melhor."}\n\nDica: nunca negocie abaixo de 4% em vendas. Seu trabalho tem valor.`,
      `Para decidir sobre MEI vs ME, a regra é simples:\n\n• **MEI**: até R$81.000/ano (R$6.750/mês) — DAS fixo ~R$70/mês\n• **ME Simples**: acima disso — alíquota a partir de 6%\n• **Ponto de virada**: quando faturar consistentemente acima de R$6K/mês\n\n${memory.facts.length > 0 ? `Com base no que você mencionou (${memory.facts.join(", ")}), ` : ""}O mais importante: não estoure o limite do MEI. A multa é alta.`,
      `Para precificar com lucro, faça essa conta:\n\n1. **Custos fixos mensais**: aluguel + telefone + carro + sistema + marketing\n2. **Meta de lucro**: quanto quer levar pra casa\n3. **Vendas necessárias**: (custos + lucro) / comissão média\n\nExemplo: Custo R$5K + Meta R$10K = precisa fechar R$300K em vendas/mês (a 5%).`,
    ],
    assistente_fiscal: [
      `Sobre nota fiscal para corretor:\n\n**Se você é MEI:**\n• Nota para pessoa física: não é obrigatório (mas recomendo)\n• Nota para empresa/imobiliária: obrigatório sim\n• Emita pelo portal do MEI ou app do governo\n\n**Se você é ME/Simples:**\n• Obrigatório em todas as operações\n• Emita NFS-e pela prefeitura da sua cidade\n\n⚠️ Guarde todas as notas por 5 anos. Importante: consulte seu contador para o enquadramento correto.`,
      `MEI em 2026:\n\n• **Limite anual**: R$81.000 (R$6.750/mês)\n• **DAS mensal**: ~R$75 (INSS + ISS)\n• **CNAE corretor**: 6821-8/01\n• **Pode ter 1 funcionário**\n\nAtenção: se ultrapassar o limite em até 20%, paga diferença no Simples. Acima de 20%, desenquadra retroativamente. Fique de olho!`,
    ],
    assistente_vendas: [
      `**Quando o cliente pede desconto:**\n\nNão diga "não posso" nem "vou ver". Use isso:\n\n🟢 **Opção diplomática:**\n"Entendo sua preocupação com o valor. Me deixa te mostrar por que esse imóvel vale cada real — e vou te mostrar condições que podem facilitar."\n\n🔵 **Opção assertiva:**\n"Esse valor já está muito competitivo para a região. O que posso fazer é negociar a forma de pagamento. O que seria ideal para você?"\n\n🟡 **Opção de contraproposta:**\n"Posso consultar o proprietário, mas para isso preciso de uma proposta formal. Qual valor seria justo na sua visão?"\n\n**Por que funciona:** Você não disse "não", redirecionou para o valor percebido e abriu negociação.`,
      `**Script para follow-up após visita sem retorno:**\n\n📱 WhatsApp (3 dias depois):\n"Oi [nome]! Tudo bem? Fiquei pensando na nossa visita ao [imóvel]. Surgiu alguma dúvida? Tô aqui se quiser conversar sobre condições 😊"\n\n📱 Se não responder (7 dias):\n"[Nome], só passando pra avisar que tivemos mais interessados no [imóvel]. Se ainda estiver no seu radar, é bom a gente conversar essa semana. O que acha?"\n\n**Por que funciona:** Escassez real + baixa pressão + facilita a resposta.`,
    ],
    parceiro_decisao: [
      `Boa pergunta. Antes de analisar, preciso entender:\n\n1. **Seu momento**: Há quanto tempo trabalha como corretor?\n2. **Faturamento atual**: Quanto está tirando por mês?\n3. **Rede de contatos**: Já tem carteira própria de clientes?\n4. **Custos da imobiliária**: Quanto paga de mesa/split hoje?\n\n${memory.facts.length > 0 ? `Pelo que você já me contou (${memory.facts.join(", ")}), inclino para...` : "Com essas informações consigo te dar uma análise objetiva."}\n\nResumo rápido:\n• **Solo**: mais liberdade, mais risco, precisa de marketing próprio\n• **Imobiliária**: estrutura, leads, marca, mas split de 40-50%\n• **Parceria**: meio-termo, divide custos e responsabilidades`,
      `Para analisar essa proposta de parceria, considere:\n\n**PRÓS potenciais:**\n• Divisão de custos fixos\n• Complemento de habilidades\n• Mais credibilidade\n\n**CONTRAS / RISCOS:**\n• Conflito de visão/gestão\n• Divisão desigual de trabalho\n• Saída complicada se não der certo\n\n**Antes de aceitar, resolva:**\n✅ Contrato societário com cláusula de saída\n✅ Divisão clara de papéis (quem faz o quê)\n✅ Acordo financeiro por escrito\n✅ Período de teste (3-6 meses)\n\n**Minha recomendação:** Faça um projeto-piloto de 90 dias antes de formalizar sociedade.`,
    ],
    suporte_sufoco: [
      `Ei, entendo. Semana sem cliente é pesada, eu sei. E a ansiedade de ficar olhando o celular esperando uma mensagem é real.\n\nMas olha: isso NÃO significa que você não é bom. O mercado imobiliário tem ciclos — e semanas secas fazem parte.\n\n${memory.facts.length > 0 ? `Lembra que você mencionou "${memory.facts[memory.facts.length - 1]}"? Aquilo mostra que você sabe o que tá fazendo.` : ""}\n\n**Uma coisa pra fazer AGORA:**\nPega o celular e manda mensagem para 5 clientes antigos. Não precisa vender nada — só pergunte como estão. "Oi fulano, tudo bem? Lembrei de você, como tá a busca pelo imóvel?"\n\nIsso reativa relacionamentos e geralmente gera pelo menos 1-2 conversas. Você não está parado — está plantando.`,
      `Cara, obrigado por compartilhar isso. Pensar em desistir não te faz fraco — te faz humano. Todo corretor que eu conheço já pensou nisso pelo menos uma vez.\n\nMas antes de decidir, me responde com sinceridade:\n\n1. Você está cansado do mercado ou cansado de como está trabalhando?\n2. Se tivesse 3 clientes quentes agora, ainda pensaria em desistir?\n\nNa maioria das vezes, o problema não é a profissão — é o método. E método se ajusta.\n\n**O que eu faria no seu lugar:**\nTira 1 dia de folga real (sem culpa). Depois, escolhe UMA coisa pra mudar na semana que vem. Só uma. Pode ser: postar todo dia, ligar pra 3 leads antigos, ou pedir indicação pra 1 cliente.\n\nVocê não precisa mudar tudo. Precisa mudar uma coisa.`,
    ],
  };

  const pool = responses[agentId] ?? [
    `Entendi sua pergunta. ${memory.facts.length > 0 ? `Com base no que sei sobre você (${memory.facts.slice(-2).join(", ")}), ` : ""}vou te dar uma orientação prática...\n\nPreciso de mais contexto para ser mais específico. Pode me contar mais detalhes?`,
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAgentChat(agentId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState<AgentMemory>({ agentId: "", facts: [], lastInteraction: "" });
  const [isTyping, setIsTyping] = useState(false);

  // Load on mount / agent change
  useEffect(() => {
    if (!agentId) return;
    setMessages(loadMessages(agentId));
    setMemory(loadMemory(agentId));
  }, [agentId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!agentId || !content.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveMessages(agentId, updatedMessages);

    // Extract facts for memory
    const newFacts = extractFacts(content);
    const updatedMemory: AgentMemory = {
      agentId,
      facts: [...new Set([...memory.facts, ...newFacts])].slice(-20), // Keep last 20 facts
      lastInteraction: new Date().toISOString(),
    };
    setMemory(updatedMemory);
    saveMemory(agentId, updatedMemory);

    // Generate response
    setIsTyping(true);
    try {
      // TODO: Replace with real API call:
      // const response = await supabase.functions.invoke("agent-chat", {
      //   body: { agentId, message: content, memory: updatedMemory, history: updatedMessages.slice(-10) }
      // });

      const responseText = await generateMockResponse(agentId, content, updatedMemory);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      saveMessages(agentId, finalMessages);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveMessages(agentId, finalMessages);
    } finally {
      setIsTyping(false);
    }
  }, [agentId, messages, memory]);

  const clearHistory = useCallback(() => {
    if (!agentId) return;
    setMessages([]);
    localStorage.removeItem(`${STORAGE_PREFIX}${agentId}`);
  }, [agentId]);

  const clearMemory = useCallback(() => {
    if (!agentId) return;
    const empty = { agentId, facts: [], lastInteraction: "" };
    setMemory(empty);
    localStorage.removeItem(`${MEMORY_PREFIX}${agentId}`);
  }, [agentId]);

  return {
    messages,
    memory,
    isTyping,
    sendMessage,
    clearHistory,
    clearMemory,
    factCount: memory.facts.length,
  };
}
