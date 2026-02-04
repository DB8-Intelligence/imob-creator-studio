import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import { 
  Plus, 
  Image, 
  Video, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

// Brand data
const brands = [
  {
    id: "douglas-bonanzza",
    name: "Douglas Bonanzza Imóveis",
    logo: "🏠",
    primaryColor: "#1E3A5F",
    secondaryColor: "#D4AF37",
    description: "Tradição e excelência no mercado imobiliário",
    style: "Sofisticado e Tradicional"
  },
  {
    id: "db8",
    name: "DB8 Imobiliária", 
    logo: "🏢",
    primaryColor: "#18181B",
    secondaryColor: "#FACC15",
    description: "Inovação e agilidade em cada negócio",
    style: "Moderno e Dinâmico"
  }
];

const recentCreatives = [
  { id: 1, title: "Casa Alphaville", type: "Feed", date: "Hoje", status: "published" },
  { id: 2, title: "Apto Moema", type: "Story", date: "Ontem", status: "scheduled" },
  { id: 3, title: "Terreno Granja", type: "Carrossel", date: "3 dias", status: "draft" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
  };

  const handleStartCreating = () => {
    if (selectedBrand) {
      navigate("/upload");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Olá, Corretor! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Pronto para criar criativos incríveis?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              47 créditos restantes
            </Badge>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/upload")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Criativo
            </Button>
          </div>
        </div>

        {/* Brand Selection */}
        <section>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Selecione sua Marca
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {brands.map((brand) => (
              <Card 
                key={brand.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-elevated ${
                  selectedBrand === brand.id 
                    ? "ring-2 ring-accent shadow-glow" 
                    : "hover:border-accent/50"
                }`}
                onClick={() => handleBrandSelect(brand.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: brand.secondaryColor + "20" }}
                      >
                        {brand.logo}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {brand.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {brand.description}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {brand.style}
                        </Badge>
                      </div>
                    </div>
                    {selectedBrand === brand.id && (
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">Cores:</span>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: brand.secondaryColor }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedBrand && (
            <div className="mt-4 flex justify-end">
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleStartCreating}
              >
                Continuar com esta marca
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-xs text-muted-foreground">Posts criados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Reels gerados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Agendados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1.2k</p>
                <p className="text-xs text-muted-foreground">Alcance total</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Creatives */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Criativos Recentes
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/library")}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {recentCreatives.map((creative) => (
              <Card key={creative.id} className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{creative.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {creative.type} • {creative.date}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        creative.status === "published" ? "default" :
                        creative.status === "scheduled" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {creative.status === "published" ? "Publicado" :
                       creative.status === "scheduled" ? "Agendado" : "Rascunho"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
