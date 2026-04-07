import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function UsuariosPermissoesPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/usuarios", { replace: true }); }, [navigate]);
  return null;
}
