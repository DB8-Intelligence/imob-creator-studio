import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem("banner_closed"));

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem("banner_closed", "1");
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#21346e] text-white overflow-hidden relative z-[60]"
        >
          <div className="container mx-auto px-6 h-11 flex items-center justify-center gap-2 text-sm font-medium">
            <span className="hidden sm:inline">🚀 Lançamento especial — Primeiros 100 corretores com 30% OFF ·</span>
            <span className="sm:hidden">🚀 30% OFF primeiros 100 ·</span>
            <Link to="/criativos#planos" className="font-bold text-[#FFD700] underline underline-offset-2 hover:no-underline">
              Garantir desconto →
            </Link>
            <button type="button" onClick={dismiss} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors" aria-label="Fechar">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
