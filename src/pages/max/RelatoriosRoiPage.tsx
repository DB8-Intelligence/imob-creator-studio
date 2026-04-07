import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RelatoriosRoiPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/relatorios", { replace: true }); }, [navigate]);
  return null;
}
