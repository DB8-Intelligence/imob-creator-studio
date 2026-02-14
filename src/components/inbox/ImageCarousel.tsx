import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, GripVertical, ImageIcon } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onRemove: (index: number) => void;
}

const ImageCarousel = ({ images, onReorder, onRemove }: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const goTo = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...images];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    onReorder(reordered);
    setActiveIndex(dragOverItem.current);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
        <p className="text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video bg-muted rounded-xl overflow-hidden group">
        <img
          src={images[activeIndex]}
          alt={`Imagem ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Remove button */}
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
          onClick={() => {
            onRemove(activeIndex);
            if (activeIndex >= images.length - 1 && activeIndex > 0) {
              setActiveIndex(activeIndex - 1);
            }
          }}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Thumbnails with drag & drop */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <div
            key={`${img}-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => setActiveIndex(i)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-colors ${
              i === activeIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
            }`}
          >
            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <GripVertical className="w-3 h-3 text-white opacity-0 hover:opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
