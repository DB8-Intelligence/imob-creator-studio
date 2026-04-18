import { Navigate } from "react-router-dom";

/**
 * WhatsApp não é produto standalone — ele vive dentro da Secretária AI,
 * que oferece IA que atende WhatsApp, voice cloning, CRM WhatsApp (Plus)
 * e todas as features de atendimento automatizado.
 */
export default function WhatsappPage() {
  return <Navigate to="/secretaria-virtual" replace />;
}
