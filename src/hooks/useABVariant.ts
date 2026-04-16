import { useState } from "react";

export type ABVariant = "a" | "b";

/**
 * Hook simples de A/B testing.
 * Prioridade: URL param ?variant=b > localStorage > default "a"
 * Persiste escolha em localStorage para consistência entre sessões.
 */
export function useABVariant(): ABVariant {
  const [variant] = useState<ABVariant>(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("variant");
    if (fromUrl === "a" || fromUrl === "b") {
      localStorage.setItem("ab_variant", fromUrl);
      return fromUrl;
    }
    const stored = localStorage.getItem("ab_variant");
    if (stored === "a" || stored === "b") return stored;
    // Atribuição aleatória 50/50 para novos visitantes
    const assigned: ABVariant = Math.random() < 0.5 ? "a" : "b";
    localStorage.setItem("ab_variant", assigned);
    return assigned;
  });
  return variant;
}
