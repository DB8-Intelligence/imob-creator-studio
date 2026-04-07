/**
 * CriativosTemplatesPage.tsx — Biblioteca de templates (MAX)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Palette, FileText, Video, LayoutGrid, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Todos", "Feed", "Stories", "Reel", "Carrossel"];

const MOCK_TEMPLATES = [
  { id: "t1", nome: "Captação Express", categoria: "Feed", estilo: "Moderno", preview: null, popularidade: 95 },
  { id: "t2", nome: "Luxo Premium", categoria: "Feed", estilo: "Luxo", preview: null, popularidade: 88 },
  { id: "t3", nome: "Story Destaque", categoria: "Stories", estilo: "Minimalista", preview: null, popularidade: 76 },
  { id: "t4", nome: "Reel Tour Virtual", categoria: "Reel", estilo: "Cinematográfico", preview: null, popularidade: 92 },
  { id: "t5", nome: "Carrossel Comparativo", categoria: "Carrossel", estilo: "Corporativo", preview: null, popularidade: 70 },
  { id: "t6", nome: "Story Preço Novo", categoria: "Stories", estilo: "Urgência", preview: null, popularidade: 84 },
  { id: "t7", nome: "Feed Lançamento", categoria: "Feed", estilo: "Moderno", preview: null, popularidade: 81 },
  { id: "t8", nome: "Reel Before/After", categoria: "Reel", estilo: "Impactante", preview: null, popularidade: 90 },
];

const ESTILO_COLORS: Record<string, string> = {
  Moderno: "bg-blue-500/10 text-blue-500",
  Luxo: "bg-amber-500/10 text-amber-500",
  Minimalista: "bg-slate-500/10 text-slate-500",
  Cinematográfico: "bg-violet-500/10 text-violet-500",
  Corporativo: "bg-cyan-500/10 text-cyan-500",
  "Urgência": "bg-red-500/10 text-red-500",
  Impactante: "bg-pink-500/10 text-pink-500",
};

export default function CriativosTemplatesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Todos");

  const filtered = category === "Todos" ? MOCK_TEMPLATES : MOCK_TEMPLATES.filter((t) => t.categoria === category);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criativos</h1>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="posts" className="gap-1.5" onClick={() => navigate("/criativos")}><FileText className="w-4 h-4" />Posts & Legendas</TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5" onClick={() => navigate("/criativos/videos")}><Video className="w-4 h-4" />Vídeos</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5"><LayoutGrid className="w-4 h-4" />Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4 space-y-4">
            {/* Category filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      category === cat ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >{cat}</button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />Template personalizado
              </Button>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((t) => (
                <Card key={t.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/20 group-hover:text-accent/30 transition-colors" />
                  </div>
                  <CardContent className="p-3 space-y-1.5">
                    <p className="font-medium text-foreground text-sm">{t.nome}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{t.categoria}</Badge>
                      <Badge variant="secondary" className={cn("text-[10px]", ESTILO_COLORS[t.estilo])}>{t.estilo}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
