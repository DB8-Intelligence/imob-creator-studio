/**
 * ImageUploader — upload de imagens do imovel com drag-and-drop,
 * preview em thumbnail e upload para Supabase Storage bucket 'property-media'.
 *
 * Permite selecionar quantas imagens (1-3) e faz upload paralelo.
 */
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, Loader2, ImagePlus, Check } from "lucide-react";

const BUCKET = "property-media";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadedImage {
  file: File;
  preview: string;   // object URL for local preview
  publicUrl?: string; // Supabase public URL after upload
  uploading: boolean;
  error?: string;
}

interface ImageUploaderProps {
  /** How many images the user wants to use */
  imageCount: 1 | 2 | 3;
  onImageCountChange: (count: 1 | 2 | 3) => void;
  /** Uploaded image URLs (public URLs from Supabase) */
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export function ImageUploader({
  imageCount,
  onImageCountChange,
  images,
  onImagesChange,
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadToSupabase = useCallback(async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id ?? "anonymous";
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${uid}/uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const slotsAvailable = imageCount - images.length;
    const toProcess = fileArray
      .filter((f) => f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE)
      .slice(0, Math.max(0, slotsAvailable));

    if (toProcess.length === 0) return;

    // Create entries with local preview
    const newEntries: UploadedImage[] = toProcess.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    const updated = [...images, ...newEntries];
    onImagesChange(updated);

    // Upload each in parallel
    const baseIndex = images.length;
    const results = await Promise.allSettled(
      toProcess.map((file, i) =>
        uploadToSupabase(file).then((url) => ({ index: baseIndex + i, url }))
      )
    );

    // Build final array from the snapshot we have (updated = images + newEntries)
    const final = [...updated];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { index, url } = result.value;
        if (final[index]) {
          final[index] = { ...final[index], publicUrl: url, uploading: false };
        }
      } else {
        const idx = final.findIndex((img, j) => img.uploading && j >= baseIndex);
        if (idx >= 0) {
          final[idx] = { ...final[idx], uploading: false, error: "Falha no upload" };
        }
      }
    }
    onImagesChange(final);
  }, [images, imageCount, onImagesChange, uploadToSupabase]);

  const removeImage = useCallback((index: number) => {
    const img = images[index];
    if (img?.preview) URL.revokeObjectURL(img.preview);
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const canAddMore = images.length < imageCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Image count selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--ds-fg-muted)]">Quantas imagens?</span>
        <div className="flex gap-1.5">
          {([1, 2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                onImageCountChange(n);
                // Trim images if new count is smaller
                if (images.length > n) {
                  onImagesChange(images.slice(0, n));
                }
              }}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-semibold transition-all",
                imageCount === n
                  ? "bg-[var(--ds-cyan)] text-black"
                  : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnails grid + drop zone */}
      <div className="flex gap-3 flex-wrap">
        {/* Existing images */}
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--ds-border)] bg-[var(--ds-surface)] shrink-0"
          >
            <img
              src={img.preview}
              alt={`Imagem ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Upload status overlay */}
            {img.uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            {img.error && (
              <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                <span className="text-[10px] text-white font-medium px-1 text-center">{img.error}</span>
              </div>
            )}
            {img.publicUrl && !img.uploading && (
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* Drop zone / add button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all shrink-0",
              dragOver
                ? "border-[var(--ds-cyan)] bg-[rgba(0,242,255,0.08)]"
                : "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)]"
            )}
          >
            <ImagePlus className={cn(
              "w-5 h-5",
              dragOver ? "text-[var(--ds-cyan)]" : "text-[var(--ds-fg-subtle)]"
            )} />
            <span className="text-[10px] text-[var(--ds-fg-subtle)]">
              {images.length === 0 ? "Adicionar" : `+${imageCount - images.length}`}
            </span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={imageCount > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--ds-fg-subtle)]">
        <Camera className="w-3.5 h-3.5" />
        <span>Arraste ou clique para adicionar fotos do imovel (max {MAX_FILE_SIZE / 1024 / 1024}MB cada)</span>
      </div>
    </div>
  );
}
