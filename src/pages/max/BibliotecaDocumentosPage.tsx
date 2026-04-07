import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function BibliotecaDocumentosPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/biblioteca", { replace: true }); }, [navigate]);
  return null;
}
