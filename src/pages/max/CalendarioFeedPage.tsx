import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function CalendarioFeedPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/calendario", { replace: true, state: { tab: "feed" } }); }, [navigate]);
  return null;
}
