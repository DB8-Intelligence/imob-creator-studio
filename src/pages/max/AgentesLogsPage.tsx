/**
 * AgentesLogsPage.tsx — Redireciona para aba Logs da página de agentes
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AgentesLogsPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/agentes", { replace: true }); }, [navigate]);
  return null;
}
