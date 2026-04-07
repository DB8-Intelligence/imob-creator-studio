import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function IntegracoesWebhooksPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/integracoes", { replace: true }); }, [navigate]);
  return null;
}
