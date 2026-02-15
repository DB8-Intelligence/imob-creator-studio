import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetDropZoneProps {
  label: string;
  value: string;
  accept: string;
  isUploading: boolean;
  onChange: (value: string) => void;
  onFileSelect: (file: File) => void;
}

const AssetDropZone = ({ label, value, accept, isUploading, onChange, onFileSelect }: AssetDropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
            <img src={value} alt={label} className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50 hover:border-primary/50 hover:bg-muted"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <ImageIcon className={cn("w-6 h-6", isDragging ? "text-primary" : "text-muted-foreground")} />
            )}
          </div>
        )}

        <div className="flex-1 space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            Upload {label}
          </Button>
          <p className="text-xs text-muted-foreground">Arraste aqui ou cole uma URL</p>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

export default AssetDropZone;
