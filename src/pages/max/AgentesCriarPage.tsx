/**
 * AgentesCriarPage.tsx — Redireciona para aba Criar da página de agentes
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AgentesCriarPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/agentes", { replace: true }); }, [navigate]);
  return null;
}
