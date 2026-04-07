/**
 * LogoManager — upload, posicionamento e controle de logos para criativos.
 *
 * - Upload PNG/SVG/WEBP max 5MB
 * - Grid 3x3 para posicionamento (9 pontos)
 * - Sliders: tamanho (5-40%) e opacidade (10-100%)
 * - Salva/carrega logos do perfil do usuario (max 4)
 * - Upload para Supabase Storage bucket 'property-media'
 */
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Upload, X, Loader2, Check, Trash2 } from "lucide-react";

const BUCKET = "property-media";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/png", "image/webp"];
const MAX_LOGOS = 4;

export type LogoPosition =
  | "topLeft"    | "top"    | "topRight"
  | "left"       | "center" | "right"
  | "bottomLeft" | "bottom" | "bottomRight";

const POSITION_GRID: { id: LogoPosition; label: string }[] = [
  { id: "topLeft",    label: "Sup. Esq." },
  { id: "top",        label: "Superior"   },
  { id: "topRight",   label: "Sup. Dir."  },
  { id: "left",       label: "Esquerda"   },
  { id: "center",     label: "Centro"     },
  { id: "right",      label: "Direita"    },
  { id: "bottomLeft", label: "Inf. Esq."  },
  { id: "bottom",     label: "Inferior"   },
  { id: "bottomRight",label: "Inf. Dir."  },
];

export interface SavedLogo {
  id: string;
  url: string;
  name: string;
}

export interface LogoConfig {
  logoUrl: string | null;
  position: LogoPosition;
  size: number;     // 5-40 (%)
  opacity: number;  // 10-100 (%)
}

interface LogoManagerProps {
  config: LogoConfig;
  onChange: (config: LogoConfig) => void;
  /** Pre-loaded saved logos (from user brand profile) */
  savedLogos?: SavedLogo[];
  onSavedLogosChange?: (logos: SavedLogo[]) => void;
}

export function LogoManager({
  config,
  onChange,
  savedLogos = [],
  onSavedLogosChange,
}: LogoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadLogo = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato invalido. Use PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Arquivo muito grande. Max 5MB.");
      return;
    }
    if (savedLogos.length >= MAX_LOGOS) {
      setError(`Maximo de ${MAX_LOGOS} logos atingido. Remova uma antes.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? "anonymous";
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${uid}/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const newLogo: SavedLogo = {
        id: path,
        url: data.publicUrl,
        name: file.name,
      };

      const updated = [...savedLogos, newLogo];
      onSavedLogosChange?.(updated);

      // Auto-select the newly uploaded logo
      onChange({ ...config, logoUrl: data.publicUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }, [savedLogos, config, onChange, onSavedLogosChange]);

  const removeSavedLogo = useCallback((logo: SavedLogo) => {
    const updated = savedLogos.filter((l) => l.id !== logo.id);
    onSavedLogosChange?.(updated);
    // If the removed logo was selected, clear selection
    if (config.logoUrl === logo.url) {
      onChange({ ...config, logoUrl: updated.length > 0 ? updated[0].url : null });
    }
  }, [savedLogos, config, onChange, onSavedLogosChange]);

  const selectLogo = useCallback((url: string) => {
    onChange({ ...config, logoUrl: url });
  }, [config, onChange]);

  return (
    <div className="flex flex-col gap-5">
      {/* Saved logos grid + upload */}
      <div>
        <p className="text-xs font-semibold text-[var(--ds-fg-muted)] mb-2">
          Suas logos ({savedLogos.length}/{MAX_LOGOS})
        </p>
        <div className="flex gap-3 flex-wrap">
          {savedLogos.map((logo) => {
            const isActive = config.logoUrl === logo.url;
            return (
              <div key={logo.id} className="relative group">
                <button
                  type="button"
                  onClick={() => selectLogo(logo.url)}
                  className={cn(
                    "w-16 h-16 rounded-xl border-2 overflow-hidden bg-[var(--ds-surface)] p-1.5 transition-all",
                    isActive
                      ? "border-[var(--ds-cyan)] shadow-[0_0_0_1px_var(--ds-cyan)]"
                      : "border-[var(--ds-border)] hover:border-[var(--ds-border-2)]"
                  )}
                >
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="w-full h-full object-contain"
                  />
                  {isActive && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[var(--ds-cyan)] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" />
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeSavedLogo(logo)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            );
          })}

          {/* Upload button */}
          {savedLogos.length < MAX_LOGOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-all",
                "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)]",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 text-[var(--ds-fg-subtle)] animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[var(--ds-fg-subtle)]" />
                  <span className="text-[9px] text-[var(--ds-fg-subtle)]">Logo</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-[11px] text-red-400 mt-1.5">{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".png,.webp,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadLogo(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Position grid (only when a logo is selected) */}
      {config.logoUrl && (
        <>
          <div>
            <p className="text-xs font-semibold text-[var(--ds-fg-muted)] mb-2">
              Posicao da logo
            </p>
            <div className="grid grid-cols-3 gap-1.5 w-fit">
              {POSITION_GRID.map((pos) => {
                const isActive = config.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onChange({ ...config, position: pos.id })}
                    className={cn(
                      "w-14 h-10 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center",
                      isActive
                        ? "bg-[var(--ds-cyan)] text-black"
                        : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-subtle)] hover:border-[var(--ds-border-2)]"
                    )}
                    title={pos.label}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isActive ? "bg-black" : "bg-[var(--ds-fg-subtle)]"
                    )} />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-1">
              {POSITION_GRID.find((p) => p.id === config.position)?.label}
            </p>
          </div>

          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--ds-fg-muted)]">Tamanho</p>
              <span className="text-xs font-mono text-[var(--ds-fg-subtle)]">{config.size}%</span>
            </div>
            <Slider
              value={[config.size]}
              onValueChange={([v]) => onChange({ ...config, size: v })}
              min={5}
              max={40}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--ds-fg-subtle)] mt-1">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Opacity slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--ds-fg-muted)]">Opacidade</p>
              <span className="text-xs font-mono text-[var(--ds-fg-subtle)]">{config.opacity}%</span>
            </div>
            <Slider
              value={[config.opacity]}
              onValueChange={([v]) => onChange({ ...config, opacity: v })}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--ds-fg-subtle)] mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preview */}
          <div className="relative w-full aspect-video rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-conic-gradient(var(--ds-surface)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]" />
            <div
              className={cn(
                "absolute",
                config.position === "topLeft"     && "top-2 left-2",
                config.position === "top"          && "top-2 left-1/2 -translate-x-1/2",
                config.position === "topRight"     && "top-2 right-2",
                config.position === "left"         && "top-1/2 left-2 -translate-y-1/2",
                config.position === "center"       && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                config.position === "right"        && "top-1/2 right-2 -translate-y-1/2",
                config.position === "bottomLeft"   && "bottom-2 left-2",
                config.position === "bottom"       && "bottom-2 left-1/2 -translate-x-1/2",
                config.position === "bottomRight"  && "bottom-2 right-2",
              )}
              style={{
                width: `${config.size}%`,
                opacity: config.opacity / 100,
              }}
            >
              <img
                src={config.logoUrl}
                alt="Logo preview"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
