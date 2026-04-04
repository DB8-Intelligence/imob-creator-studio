/**
 * kiwify-links.ts — Fonte única de verdade para todos os checkouts Kiwify.
 *
 * ════════════════════════════════════════════════════════════════════
 *  CHECKLIST DE PREENCHIMENTO (17 entradas)
 * ════════════════════════════════════════════════════════════════════
 *
 *  ASSINATURAS ImobCreator  (KIWIFY_SUBSCRIPTION_LINKS)
 *  [ ] starter   mensal
 *  [ ] starter   anual
 *  [ ] standard  mensal
 *  [ ] standard  anual
 *  [ ] plus      mensal
 *  [ ] plus      anual
 *  [ ] premium   mensal
 *  [ ] premium   anual
 *
 *  CRÉDITOS AVULSOS ImobCreator  (KIWIFY_CREDIT_LINKS)
 *  [ ] 20  créditos  — R$ 59
 *  [ ] 50  créditos  — R$ 97
 *  [ ] 150 créditos  — R$ 197
 *
 *  VÍDEO Omnix Reels  (KIWIFY_VIDEO_LINKS)
 *  [x] standard  mensal  ← já tem link real
 *  [ ] standard  anual   ← criar produto anual no Kiwify, substituir aqui
 *  [ ] plus      mensal
 *  [ ] plus      anual
 *  [ ] premium   mensal
 *  [ ] premium   anual
 *
 * ════════════════════════════════════════════════════════════════════
 *  CONSUMIDORES — não editar estas páginas, só editar aqui
 * ════════════════════════════════════════════════════════════════════
 *  KIWIFY_SUBSCRIPTION_LINKS → src/pages/PlansPage.tsx
 *                               src/views/PlansPage.tsx
 *  KIWIFY_CREDIT_LINKS       → src/pages/PlanPage.tsx
 *  KIWIFY_VIDEO_LINKS        → src/components/VideoPricingCards.tsx
 *                               src/pages/VideosPricingPage.tsx
 *
 *  COMO PEGAR OS LINKS:
 *  Kiwify → Produtos → (produto) → Copiar link de checkout
 *  Formato: https://pay.kiwify.com.br/XXXXXXX
 */

// ─── Assinaturas ImobCreator ─────────────────────────────────────────────────

export const KIWIFY_SUBSCRIPTION_LINKS = {
  starter: {
    monthly: "https://pay.kiwify.com.br/TODO",  // TODO [ ] starter mensal
    yearly:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] starter anual
  },
  standard: {
    monthly: "https://pay.kiwify.com.br/TODO",  // TODO [ ] standard mensal
    yearly:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] standard anual
  },
  plus: {
    monthly: "https://pay.kiwify.com.br/TODO",  // TODO [ ] plus mensal
    yearly:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] plus anual
  },
  premium: {
    monthly: "https://pay.kiwify.com.br/TODO",  // TODO [ ] premium mensal
    yearly:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] premium anual
  },
} as const;

// ─── Créditos avulsos ImobCreator ────────────────────────────────────────────

export const KIWIFY_CREDIT_LINKS: Record<number, string> = {
  20:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] 20 créditos  — R$ 59
  50:  "https://pay.kiwify.com.br/TODO",  // TODO [ ] 50 créditos  — R$ 97
  150: "https://pay.kiwify.com.br/TODO",  // TODO [ ] 150 créditos — R$ 197
};

// ─── Planos de vídeo Omnix Reels ─────────────────────────────────────────────
// ⚠ standard.yearly usa o mesmo link do mensal enquanto o produto anual
//   não for criado no Kiwify. Substitua quando criar o produto anual.

export const KIWIFY_VIDEO_LINKS = {
  standard: {
    monthly: "https://pay.kiwify.com.br/4LRnoknhsh2Fpxr",  // ✅ REAL (mensal)
    yearly:  "https://pay.kiwify.com.br/4LRnoknhsh2Fpxr",  // ⚠ TODO [ ] criar produto anual e substituir
  },
  plus: {
    monthly: "https://pay.kiwify.com.br/TODO",              // TODO [ ] plus mensal
    yearly:  "https://pay.kiwify.com.br/TODO",              // TODO [ ] plus anual
  },
  premium: {
    monthly: "https://pay.kiwify.com.br/TODO",              // TODO [ ] premium mensal
    yearly:  "https://pay.kiwify.com.br/TODO",              // TODO [ ] premium anual
  },
} as const;
