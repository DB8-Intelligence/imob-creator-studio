import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/app/AppLayout";
import { 
  Search, 
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  ImageIcon
} from "lucide-react";

// Sample library items
const libraryItems = [
  { id: 1, title: "Casa Alphaville", type: "Feed", status: "published", date: "02/02/2026", brand: "DB8" },
  { id: 2, title: "Apto Moema Luxo", type: "Story", status: "scheduled", date: "03/02/2026", brand: "DB8" },
  { id: 3, title: "Terreno Granja Viana", type: "Carrossel", status: "draft", date: "01/02/2026", brand: "Douglas" },
  { id: 4, title: "Cobertura Itaim", type: "Feed", status: "published", date: "30/01/2026", brand: "DB8" },
  { id: 5, title: "Casa Jardins", type: "Story", status: "published", date: "28/01/2026", brand: "Douglas" },
  { id: 6, title: "Loft Vila Madalena", type: "Feed", status: "draft", date: "27/01/2026", brand: "DB8" },
  { id: 7, title: "Mansão Morumbi", type: "Carrossel", status: "published", date: "25/01/2026", brand: "Douglas" },
  { id: 8, title: "Studio Pinheiros", type: "Feed", status: "scheduled", date: "05/02/2026", brand: "DB8" },
];

const Library = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Publicado</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Agendado</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Biblioteca
            </h1>
            <p className="text-muted-foreground mt-1">
              Todos os seus criativos em um só lugar
            </p>
          </div>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/upload")}
          >
            Novo Criativo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar criativos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="border rounded-lg flex">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Todos ({libraryItems.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Publicados ({libraryItems.filter(i => i.status === "published").length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Agendados ({libraryItems.filter(i => i.status === "scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Rascunhos ({libraryItems.filter(i => i.status === "draft").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-soft transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          <Badge variant="outline" className="text-xs">{item.brand}</Badge>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground hidden sm:block">{item.date}</p>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">Nenhum criativo encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar os filtros ou criar um novo criativo
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Library;
