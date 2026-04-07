import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function BibliotecaVideosPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/biblioteca", { replace: true }); }, [navigate]);
  return null;
}
