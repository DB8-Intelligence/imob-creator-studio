import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function BookConfigPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/book", { replace: true }); }, [navigate]);
  return null;
}
