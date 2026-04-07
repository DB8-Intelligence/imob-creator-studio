/**
 * AutomacoesHistoricoPage.tsx — Redireciona para aba Histórico da página principal
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AutomacoesHistoricoPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/automacoes", { replace: true }); }, [navigate]);
  return null;
}
