import { useState, useRef, useCallback } from "react";

const STYLES = {
  fonts: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`,
};

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f;
  --bg2: #111118;
  --bg3: #18181f;
  --border: rgba(255,255,255,0.07);
  --border-glow: rgba(235,190,100,0.3);
  --gold: #e8b84b;
  --gold2: #f5d07a;
  --gold-dim: rgba(232,184,75,0.12);
  --white: #f0ede6;
  --muted: #7a7870;
  --danger: #e05555;
  --success: #4ec994;
}
body { background: var(--bg); color: var(--white); font-family: 'DM Sans', sans-serif; }
.app {
  min-height: 100vh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 60% 40% at 70% -10%, rgba(232,184,75,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 10% 80%, rgba(232,184,75,0.04) 0%, transparent 50%);
}
.header {
  border-bottom: 1px solid var(--border);
  padding: 24px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10,10,15,0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo { display: flex; align-items: baseline; gap: 2px; }
.logo-i { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: var(--gold); letter-spacing: -1px; }
.logo-mob { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--white); }
.logo-creator { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 300; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; margin-left: 4px; }
.logo-ai { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--gold); letter-spacing: 2px; border: 1px solid rgba(232,184,75,0.4); padding: 2px 6px; border-radius: 3px; margin-left: 8px; }
.header-tag {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-tag::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--gold);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--gold);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
.main { max-width: 1200px; margin: 0 auto; padding: 48px 40px 80px; }
.section-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--border-glow), transparent);
}
.hero { text-align: center; padding: 48px 0 56px; }
.hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.1;
  color: var(--white);
  margin-bottom: 16px;
}
.hero h1 em { font-style: italic; color: var(--gold); }
.hero p {
  font-size: 15px;
  color: var(--muted);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.7;
  font-weight: 300;
}
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
@media(max-width: 768px) { .grid-2, .grid-2-1 { grid-template-columns: 1fr; } }
.card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  transition: border-color 0.2s;
}
.card:hover { border-color: rgba(232,184,75,0.15); }
.card-title {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 16px;
}
.upload-zone {
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.upload-zone:hover, .upload-zone.drag { border-color: var(--gold); background: var(--gold-dim); }
.upload-zone.filled { border-style: solid; border-color: rgba(232,184,75,0.3); padding: 0; }
.upload-zone img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; display: block; }
.upload-icon { font-size: 28px; opacity: 0.4; }
.upload-text { font-size: 13px; color: var(--muted); font-weight: 300; }
.upload-sub { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); opacity: 0.5; letter-spacing: 1px; }
.upload-input { display: none; }
.upload-badge {
  position: absolute;
  top: 8px; right: 8px;
  background: var(--gold);
  color: #000;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.field { margin-bottom: 20px; }
.field label {
  display: block;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}
.field input, .field textarea, .field select {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 300;
  transition: border-color 0.2s;
  resize: none;
  outline: none;
  -webkit-appearance: none;
}
.field input::placeholder, .field textarea::placeholder { color: var(--muted); opacity: 0.5; }
.field input:focus, .field textarea:focus { border-color: rgba(232,184,75,0.4); }
.field textarea { min-height: 100px; line-height: 1.6; }
.btn-primary {
  width: 100%;
  padding: 18px;
  background: var(--gold);
  color: #0a0a0f;
  border: none;
  border-radius: 10px;
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-primary:hover:not(:disabled) { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,184,75,0.25); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-copy {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-copy:hover { border-color: var(--gold); color: var(--gold); }
.btn-copy.copied { border-color: var(--success); color: var(--success); }
.loading-bar {
  height: 2px;
  background: linear-gradient(to right, var(--gold), var(--gold2), var(--gold));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 2px;
  margin: 24px 0;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.loading-state {
  text-align: center;
  padding: 48px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg2);
}
.loading-state p {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 16px;
  animation: fade 1.5s infinite;
}
@keyframes fade { 0%,100%{opacity:1} 50%{opacity:0.4} }
.results { margin-top: 56px; }
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.results-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--white);
}
.result-badge {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.badge-gold { background: var(--gold-dim); color: var(--gold); border: 1px solid rgba(232,184,75,0.2); }
.badge-green { background: rgba(78,201,148,0.1); color: var(--success); border: 1px solid rgba(78,201,148,0.2); }
.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
@media(max-width: 768px) { .metrics-row { grid-template-columns: repeat(2,1fr); } }
.metric-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}
.metric-value {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 4px;
}
.metric-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
}
.output-block {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}
.output-block-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg3);
}
.output-block-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}
.output-block-label span { color: var(--gold); font-size: 14px; }
.output-block-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--white);
  font-weight: 300;
  white-space: pre-wrap;
  word-break: break-word;
}
.output-block-body.mono {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--gold2);
  line-height: 1.9;
  background: #0e0e14;
}
.final-prompt-card {
  background: linear-gradient(135deg, var(--bg2), #15151e);
  border: 1px solid rgba(232,184,75,0.25);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(232,184,75,0.06);
}
.final-prompt-header {
  padding: 20px 28px;
  border-bottom: 1px solid rgba(232,184,75,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(232,184,75,0.04);
}
.final-prompt-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}
.final-prompt-body {
  padding: 28px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  line-height: 2;
  color: var(--white);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 420px;
  overflow-y: auto;
}
.final-prompt-body::-webkit-scrollbar { width: 4px; }
.final-prompt-body::-webkit-scrollbar-track { background: transparent; }
.final-prompt-body::-webkit-scrollbar-thumb { background: rgba(232,184,75,0.3); border-radius: 2px; }
.divider { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
.error-msg {
  background: rgba(224,85,85,0.1);
  border: 1px solid rgba(224,85,85,0.25);
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 13px;
  color: var(--danger);
  margin-top: 16px;
}
.spinner {
  width: 40px; height: 40px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

interface ImageData {
  file: File;
  dataUrl: string;
  base64: string;
}

interface AnalysisResult {
  style: string;
  model_family: string;
  confidence: string;
  visual_changes: string[];
  analysis_summary: string;
  probable_prompt: string;
  negative_prompt: string;
  cta: string;
  final_prompt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copy}>
      {copied ? "✓ copiado" : "copiar"}
    </button>
  );
}

function UploadZone({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ImageData | null;
  onChange: (data: ImageData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({ file, dataUrl, base64: dataUrl.split(",")[1] });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="card-title">{label}</div>
      <div
        className={`upload-zone ${drag ? "drag" : ""} ${value ? "filled" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      >
        {value ? (
          <>
            <img src={value.dataUrl} alt="" />
            <div className="upload-badge">trocar</div>
          </>
        ) : (
          <>
            <div className="upload-icon">⬆</div>
            <div className="upload-text">Clique ou arraste a imagem</div>
            <div className="upload-sub">PNG · JPG · WEBP</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="upload-input"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

function OutputBlock({
  icon,
  label,
  value,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="output-block">
      <div className="output-block-header">
        <div className="output-block-label">
          <span>{icon}</span>
          {label}
        </div>
        <CopyButton text={value} />
      </div>
      <div className={`output-block-body ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}

export default function ReversePromptLabPage() {
  const [initialImg, setInitialImg] = useState<ImageData | null>(null);
  const [finalImg, setFinalImg] = useState<ImageData | null>(null);
  const [form, setForm] = useState({
    originalText: "",
    generatedText: "",
    selectedOption: "",
    modelName: "",
    ctaGoal: "gerar imagens de imóveis com alto impacto visual e apelo comercial",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const updateField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = initialImg && finalImg && !loading;

  const analyze = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const systemPrompt = `Você é o motor de análise e geração de prompts reversos do iMobCreatorAI.

Recebe:
- imagem inicial (antes da transformação)
- imagem final gerada por uma IA concorrente
- contexto textual fornecido pelo usuário

Sua missão:
1. Analisar as diferenças visuais entre antes e depois
2. Inferir o prompt que o site concorrente provavelmente usou
3. Gerar todos os outputs necessários para o iMobCreatorAI

Responda APENAS em JSON válido, sem markdown, sem texto fora do JSON, no seguinte formato exato:
{
  "style": "string - estilo visual inferido",
  "model_family": "string - família do modelo provável",
  "confidence": "alta|média|baixa",
  "visual_changes": ["change1", "change2"],
  "analysis_summary": "string - análise detalhada do antes e depois",
  "probable_prompt": "string - prompt que o concorrente provavelmente usou",
  "negative_prompt": "string - negative prompt recomendado",
  "cta": "string - CTA sugerido para o iMobCreatorAI",
  "final_prompt": "string - prompt final consolidado e otimizado para uso no iMobCreatorAI, completo, detalhado, pronto para copiar e colar"
}`;

    const userContent = [
      {
        type: "text",
        text: `Analise este par de imagens e gere o prompt reverso para o iMobCreatorAI.

CONTEXTO DO CONCORRENTE:
- Texto original digitado: ${form.originalText || "não informado"}
- Texto gerado/convertido pela IA: ${form.generatedText || "não informado"}
- Opção/estilo selecionado: ${form.selectedOption || "não informado"}
- Nome do modelo: ${form.modelName || "não informado"}
- Objetivo do CTA: ${form.ctaGoal}

A primeira imagem é o ANTES (original). A segunda imagem é o DEPOIS (gerada pelo concorrente).`,
      },
      {
        type: "image",
        source: { type: "base64", media_type: initialImg!.file.type, data: initialImg!.base64 },
      },
      {
        type: "image",
        source: { type: "base64", media_type: finalImg!.file.type, data: finalImg!.base64 },
      },
    ];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: { text?: string }) => b.text || "").join("") || "";

      let parsed: AnalysisResult;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        throw new Error("Resposta inválida da API. Tente novamente.");
      }

      setResult(parsed);
    } catch (err) {
      setError((err as Error).message || "Erro ao conectar com a API. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [initialImg, finalImg, form]);

  return (
    <>
      <style>{STYLES.fonts + css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-i">i</span>
            <span className="logo-mob">Mob</span>
            <span className="logo-creator">Creator</span>
            <span className="logo-ai">AI</span>
          </div>
          <div className="header-tag">Reverse Prompt Lab</div>
        </header>

        <main className="main">
          <div className="hero">
            <h1>Descubra o prompt <em>invisível</em><br />do seu concorrente</h1>
            <p>
              Envie a imagem antes e depois, informe o contexto da geração e o iMobCreatorAI vai reconstruir o prompt provável, analisar as transformações visuais e gerar um prompt final otimizado para você.
            </p>
          </div>

          <div className="section-label">01 — Imagens</div>
          <div className="grid-2" style={{ marginBottom: 40 }}>
            <div className="card">
              <UploadZone label="Imagem inicial (antes)" value={initialImg} onChange={setInitialImg} />
            </div>
            <div className="card">
              <UploadZone label="Imagem final gerada (depois)" value={finalImg} onChange={setFinalImg} />
            </div>
          </div>

          <div className="section-label">02 — Contexto do concorrente</div>
          <div className="card" style={{ marginBottom: 40 }}>
            <div className="grid-2">
              <div className="field">
                <label>Texto original digitado no concorrente</label>
                <textarea
                  placeholder="Ex.: apartamento moderno com varanda gourmet e vista para o mar..."
                  value={form.originalText}
                  onChange={updateField("originalText")}
                />
              </div>
              <div className="field">
                <label>Texto gerado / convertido pela IA do concorrente</label>
                <textarea
                  placeholder="Ex.: luxury penthouse, ocean view terrace, warm golden hour lighting..."
                  value={form.generatedText}
                  onChange={updateField("generatedText")}
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Opção / estilo selecionado no concorrente</label>
                <input
                  type="text"
                  placeholder="Ex.: cinematic, luxury, realistic, enhance..."
                  value={form.selectedOption}
                  onChange={updateField("selectedOption")}
                />
              </div>
              <div className="field">
                <label>Nome do modelo informado pelo concorrente</label>
                <input
                  type="text"
                  placeholder="Ex.: SDXL, Flux, Midjourney, DALL·E..."
                  value={form.modelName}
                  onChange={updateField("modelName")}
                />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Objetivo do CTA para o iMobCreatorAI</label>
              <input
                type="text"
                value={form.ctaGoal}
                onChange={updateField("ctaGoal")}
              />
            </div>
          </div>

          <div className="section-label">03 — Análise</div>
          <button className="btn-primary" onClick={analyze} disabled={!canSubmit}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000" }} />
                Analisando...
              </>
            ) : (
              <>
                <span style={{ fontSize: 18 }}>⚡</span>
                Gerar análise e prompt reverso
              </>
            )}
          </button>

          {!canSubmit && !loading && (
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 12, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              Envie as duas imagens para continuar
            </p>
          )}

          {error && <div className="error-msg">⚠ {error}</div>}

          {loading && (
            <div className="loading-state" style={{ marginTop: 40 }}>
              <div className="spinner" />
              <p>Analisando transformações visuais</p>
              <div className="loading-bar" style={{ marginTop: 24 }} />
            </div>
          )}

          {result && (
            <div className="results">
              <div className="results-header">
                <h2 className="results-title">Análise concluída</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="result-badge badge-gold">{result.style}</span>
                  <span className="result-badge badge-green">confiança {result.confidence}</span>
                </div>
              </div>

              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-value">{result.style}</div>
                  <div className="metric-label">Estilo inferido</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value" style={{ fontSize: 14 }}>{result.model_family}</div>
                  <div className="metric-label">Família do modelo</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{result.confidence}</div>
                  <div className="metric-label">Confiança</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{result.visual_changes?.length || 0}</div>
                  <div className="metric-label">Transformações</div>
                </div>
              </div>

              {result.visual_changes?.length > 0 && (
                <div className="output-block" style={{ marginBottom: 20 }}>
                  <div className="output-block-header">
                    <div className="output-block-label"><span>👁</span> Transformações visuais detectadas</div>
                  </div>
                  <div className="output-block-body">
                    {result.visual_changes.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                        <span style={{ color: "var(--gold)", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>→</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <OutputBlock icon="🔍" label="Análise visual — antes e depois" value={result.analysis_summary} />
              <OutputBlock icon="🧠" label="Prompt provável usado pelo concorrente" value={result.probable_prompt} mono />
              <OutputBlock icon="🚫" label="Negative prompt recomendado" value={result.negative_prompt} mono />
              <OutputBlock icon="📣" label="CTA sugerido para o iMobCreatorAI" value={result.cta} />

              <hr className="divider" />

              <div className="final-prompt-card">
                <div className="final-prompt-header">
                  <div className="final-prompt-title">✦ Prompt final — iMobCreatorAI</div>
                  <CopyButton text={result.final_prompt} />
                </div>
                <div className="final-prompt-body">{result.final_prompt}</div>
              </div>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>
                Copie o prompt final e cole diretamente no seu site iMobCreatorAI
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
