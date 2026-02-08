import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateMockup } from "@/data/templateMockups";

interface MockupPreviewGalleryProps {
  mockups: TemplateMockup[];
  isVertical: boolean;
}

const MockupPreviewGallery = ({ mockups, isVertical }: MockupPreviewGalleryProps) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? mockups.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === mockups.length - 1 ? 0 : c + 1));

  if (!mockups.length) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${isVertical ? "max-w-[200px]" : "max-w-[280px]"} w-full`}>
        <img
          src={mockups[current].src}
          alt={mockups[current].label}
          className={`w-full ${isVertical ? "aspect-[9/16]" : "aspect-square"} object-cover rounded-lg`}
        />
        {mockups.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 h-8 w-8"
              onClick={prev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 h-8 w-8"
              onClick={next}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      <p className="text-sm font-medium text-foreground">{mockups[current].label}</p>
      {mockups.length > 1 && (
        <div className="flex gap-1.5">
          {mockups.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-accent" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MockupPreviewGallery;
