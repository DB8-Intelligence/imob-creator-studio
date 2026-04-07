import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function LeadsCadastroPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/leads", { replace: true }); }, [navigate]);
  return null;
}
