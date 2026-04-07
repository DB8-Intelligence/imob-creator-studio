/**
 * AtendimentosNovoPage.tsx — Redireciona para a página principal de atendimentos
 * com o dialog de novo agendamento aberto.
 *
 * Aceita state: { leadId, leadNome } para prefill.
 */
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AtendimentosNovoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to main page passing state so dialog opens automatically
    navigate("/atendimentos", { state: location.state, replace: true });
  }, [navigate, location.state]);

  return null;
}
