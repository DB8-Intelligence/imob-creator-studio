import { Navigate } from "react-router-dom";

/**
 * CRM não é um produto standalone — ele vive dentro de:
 *  - Site Imobiliário (R$147/mês) → CRM dos leads dos portais
 *  - Secretária AI Plus (R$79,90/mês) → CRM do WhatsApp
 *  - Social Autopilot (R$29,90/perfil) → CRM das redes sociais
 *
 * Esta rota antiga agora redireciona pra página que explica isso.
 */
export default function CrmPage() {
  return <Navigate to="/site-imobiliario" replace />;
}
