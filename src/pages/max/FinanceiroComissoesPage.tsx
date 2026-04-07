import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function FinanceiroComissoesPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/financeiro", { replace: true }); }, [navigate]);
  return null;
}
