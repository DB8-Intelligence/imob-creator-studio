/**
 * SecretariaOnboardingWizard — Sprint 15
 * Modal full-screen mostrado no primeiro acesso pós-compra Secretária Virtual.
 * 4 passos guiados que levam do zero à IA atendendo leads.
 *
 * Trigger: user tem módulo 'whatsapp' ativo + onboarding_progress.secretaria_wizard_completed_at IS NULL
 */
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Rocket, MessageCircle, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Loader2, X, Calendar, Mic, Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TONE_PRESETS = [
  "profissional, claro e acolhedor",
  "casual e amigável, como um amigo corretor",
  "consultivo de alto padrão, atendimento premium",
  "direto e objetivo, sem enrolação",
];

const STEPS = [
  { id: 0, title: "Bem-vindo",        icon: Rocket },
  { id: 1, title: "Conectar WhatsApp", icon: MessageCircle },
  { id: 2, title: "Configurar IA",     icon: Bot },
  { id: 3, title: "Pronto!",           icon: CheckCircle2 },
];

interface SecretariaOnboardingWizardProps {
  onComplete: () => void;
  onDismiss:  () => void;
}

export default function SecretariaOnboardingWizard({ onComplete, onDismiss }: SecretariaOnboardingWizardProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [agentName, setAgentName] = useState("Secretária Virtual");
  const [agentTone, setAgentTone] = useState(TONE_PRESETS[0]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";

  const finish = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("onboarding_progress").upsert({
        user_id: user.id,
        secretaria_wizard_completed_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      onComplete();
    } finally {
      setSaving(false);
    }
  }, [user, onComplete]);

  const handleSaveAiConfig = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_whatsapp_instances")
        .update({
          ai_agent_name:    agentName.trim() || "Secretária Virtual",
          ai_agent_tone:    agentTone,
          ai_enabled:       true, // ativa imediatamente após configurar
          followup_enabled: true,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "IA configurada e ativada" });
      setStep(3);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#002B5B] to-[#4C1D95] flex items-center justify-center p-4 overflow-y-auto"
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
          aria-label="Pular onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Step indicator */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = step > i;
                const current = step === i;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 ${current ? "text-[#002B5B]" : done ? "text-emerald-600" : "text-gray-300"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        current ? "bg-[#002B5B] border-[#002B5B] text-white" :
                        done ? "bg-emerald-600 border-emerald-600 text-white" :
                        "border-gray-300"
                      }`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs font-semibold hidden sm:inline">{s.title}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > i ? "bg-emerald-600" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 min-h-[380px]">
            {step === 0 && (
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#002B5B] to-[#4C1D95] mb-4">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#002B5B] mb-2">
                  Bem-vindo, {firstName}! 👋
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  Em menos de 3 minutos você terá a sua <strong>Secretária Virtual 24h</strong> atendendo leads no WhatsApp, qualificando e agendando visitas sozinha.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-left">
                  <FeatureChip icon={MessageCircle} label="IA atende 24h" />
                  <FeatureChip icon={Calendar}      label="Agenda visitas" />
                  <FeatureChip icon={Mic}           label="Voz clonada (Plus)" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-[#002B5B] mb-2 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Conecte seu WhatsApp
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Escaneie o QR code com o WhatsApp do seu celular. A IA vai atender os leads nesse mesmo número, com a sua cara.
                </p>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-5">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Como conectar:</p>
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Clique em <strong>Abrir WhatsApp</strong> abaixo</li>
                    <li>No celular: WhatsApp → <strong>Dispositivos vinculados</strong> → Vincular dispositivo</li>
                    <li>Escaneie o QR</li>
                    <li>Volte aqui e continue</li>
                  </ol>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5">
                  <Phone className="h-4 w-4 text-amber-700 shrink-0" />
                  <p className="text-xs text-amber-800">
                    <strong>Dica:</strong> use o celular que você já atende clientes. Assim a IA mantém o mesmo número e histórico.
                  </p>
                </div>
                <Button
                  onClick={() => { navigate("/dashboard/whatsapp"); onDismiss(); }}
                  className="bg-[#25D366] hover:bg-[#1fb858] text-white gap-2 w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp Setup
                </Button>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-500 hover:text-[#002B5B] w-full text-center mt-3 underline"
                >
                  Já conectei, continuar →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-[#002B5B] mb-2 flex items-center gap-2">
                  <Bot className="h-5 w-5" /> Configure a personalidade da IA
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  Dê um nome e um tom de voz pra sua Secretária. Os leads vão conversar com ela — quanto mais humana, melhor.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name" className="text-sm font-medium">Nome do agente</Label>
                    <Input
                      id="agent-name"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="ex: Ana, Secretária do João"
                      className="mt-1.5"
                      maxLength={40}
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Se o lead perguntar "com quem estou falando?", esse é o nome que ela vai dar.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tom de voz</Label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {TONE_PRESETS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAgentTone(t)}
                          className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${
                            agentTone === t
                              ? "bg-[#002B5B] border-[#002B5B] text-white"
                              : "bg-white border-gray-200 text-gray-700 hover:border-[#002B5B]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 mb-4">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#002B5B] mb-2">Tudo pronto! 🎉</h1>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  A sua Secretária Virtual está configurada. Próximo passo: cadastrar alguns imóveis pra IA ter o que recomendar aos leads.
                </p>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 text-left">
                  <p className="text-sm font-semibold text-[#002B5B] mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" /> O que fazer agora
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">1.</span> Cadastre seus imóveis em <Link to="/imoveis/upload" className="text-blue-600 underline">Imóveis → Upload</Link></li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">2.</span> Clique em <strong>✨ Completar com IA</strong> pra preencher automaticamente</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">3.</span> Acompanhe no <Link to="/dashboard/secretaria" className="text-blue-600 underline">Hub da Secretária</Link> tudo que a IA faz</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between gap-3">
            {step > 0 && step < 3 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={saving}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            ) : (
              <div />
            )}

            {step === 0 && (
              <Button onClick={() => setStep(1)} className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2">
                Começar <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {step === 2 && (
              <Button
                onClick={handleSaveAiConfig}
                disabled={saving}
                className="bg-[#002B5B] hover:bg-[#001d3d] text-white gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar e continuar <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={() => { finish(); navigate("/dashboard/secretaria"); }}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Ir pro Hub da Secretária
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-3 py-3">
      <Icon className="h-4 w-4 text-[#002B5B]" />
      <span className="text-[11px] font-medium text-gray-700">{label}</span>
    </div>
  );
}
