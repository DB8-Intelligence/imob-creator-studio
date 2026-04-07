/**
 * CalendarioPublicacoesPage.tsx — Redireciona para calendário principal
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function CalendarioPublicacoesPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/calendario", { replace: true }); }, [navigate]);
  return null;
}
