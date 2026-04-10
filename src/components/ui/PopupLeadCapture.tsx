import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

export function PopupLeadCapture() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");

  const canShow = useCallback(() => {
    const last = localStorage.getItem("popup_shown");
    if (!last) return true;
    return Date.now() - Number(last) > 86400000; // 24h
  }, []);

  const show = useCallback(() => {
    if (canShow()) setVisible(true);
  }, [canShow]);

  const close = useCallback(() => {
    setVisible(false);
    localStorage.setItem("popup_shown", String(Date.now()));
  }, []);

  const submit = useCallback(() => {
    if (!email) return;
    const list = JSON.parse(localStorage.getItem("lead_emails") || "[]");
    list.push({ email, date: new Date().toISOString() });
    localStorage.setItem("lead_emails", JSON.stringify(list));
    toast.success("Enviado! Fique de olho no seu e-mail.");
    close();
  }, [email, close]);

  useEffect(() => {
    if (!canShow()) return;
    const timer = setTimeout(show, 30000);
    const handleExit = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseout", handleExit);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleExit);
    };
  }, [canShow, show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <button type="button" onClick={close} className="absolute top-4 right-4 text-[#6B7280] hover:text-[#0A1628] transition-colors" aria-label="Fechar">
              <X size={20} />
            </button>
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-2xl">📩</div>
              <h3 className="text-xl font-bold text-[#0A1628]">Antes de ir embora...</h3>
              <p className="text-[#6B7280] text-sm">Receba 7 dicas para dobrar seus leads com IA imobiliária</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="w-full px-4 py-3 rounded-[10px] border border-[#CBD5E1] text-sm text-[#0A1628] outline-none focus:border-[#002B5B]"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <button
                type="button"
                onClick={submit}
                className="w-full bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm py-3 rounded-[10px] transition-colors uppercase tracking-wider"
              >
                QUERO RECEBER
              </button>
              <button type="button" onClick={close} className="text-[#6B7280] text-xs hover:underline">
                Não, obrigado
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
