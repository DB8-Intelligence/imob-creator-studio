/**
 * AutomacoesConstrutorPage.tsx — Redireciona para aba Construtor da página principal
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AutomacoesConstrutorPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/automacoes", { replace: true }); }, [navigate]);
  return null;
}
