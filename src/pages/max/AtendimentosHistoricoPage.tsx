import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AtendimentosHistoricoPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/atendimentos", { replace: true }); }, [navigate]);
  return null;
}
