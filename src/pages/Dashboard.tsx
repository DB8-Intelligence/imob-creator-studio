import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/app/AppLayout";
import TenantWorkspaceCard from "@/components/app/TenantWorkspaceCard";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import UpgradePlannerCard from "@/components/billing/UpgradePlannerCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Image,
  Video,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const FORMAT_LABELS: Record<string, string> = {
  feed_square: "Feed",
  feed_portrait: "Feed",
  story: "Story",
  carousel: "Carrossel",
  reels: "Reels",
  facebook_cover: "Facebook",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: planInfo } = useUserPlan();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Brands from Supabase (system + user's)
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["dashboard-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, primary_color, secondary_color, logo_url, slogan")
        .order("is_system", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Stats from creatives table
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select("format, status")
        .eq("user_id", user!.id);
      if (error) throw error;

      const total = data.length;
      const reels = data.filter((c) => c.format === "reels").length;
      const scheduled = data.filter((c) => c.status === "scheduled").length;
      const published = data.filter((c) => c.status === "published").length;
      return { total, reels, scheduled, published };
    },
    enabled: !!user,
  });

  // Recent creatives (last 3)
  const { data: recentCreatives = [], isLoading: recentLoading } = useQuery({
    queryKey: ["dashboard-recent", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, format, status, created_at, exported_url, property_id, properties(title)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as {
        id: string;
        name: string;
        format: string;
        status: string | null;
        created_at: string;
        exported_url: string | null;
        property_id: string | null;
        properties: { title: string } | null;
      }[];
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";
  const credits = planInfo?.credits_remaining ?? null;

  const handleStartCreating = () => {
    if (selectedBrand) navigate("/upload");
  };

  const relativeDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return `${days} dias atrás`;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Pronto para criar criativos incríveis?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              {credits !== null ? `${credits} créditos restantes` : "Carregando..."}
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
          {brandsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {brands.map((brand) => (
                <Card
                  key={brand.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-elevated ${
                    selectedBrand === brand.id
                      ? "ring-2 ring-accent shadow-glow"
                      : "hover:border-accent/50"
                  }`}
                  onClick={() => setSelectedBrand(brand.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: brand.secondary_color + "20" }}
                        >
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 object-contain" />
                          ) : (
                            <span className="text-3xl">🏠</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg text-foreground">
                            {brand.name}
                          </h3>
                          {brand.slogan && (
                            <p className="text-sm text-muted-foreground mt-1">{brand.slogan}</p>
                          )}
                        </div>
                      </div>
                      {selectedBrand === brand.id && (
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-xs text-muted-foreground">Cores:</span>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: brand.primary_color }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: brand.secondary_color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
          {[
            { icon: Image, label: "Posts criados", value: statsLoading ? null : (stats?.total ?? 0) },
            { icon: Video, label: "Reels gerados", value: statsLoading ? null : (stats?.reels ?? 0) },
            { icon: Calendar, label: "Agendados", value: statsLoading ? null : (stats?.scheduled ?? 0) },
            { icon: TrendingUp, label: "Publicados", value: statsLoading ? null : (stats?.published ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  {value === null ? (
                    <Skeleton className="h-7 w-10 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
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

          {recentLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentCreatives.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Image className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum criativo ainda.</p>
                <Button className="mt-3" size="sm" onClick={() => navigate("/upload")}>
                  Criar primeiro criativo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentCreatives.map((creative) => (
                <Card
                  key={creative.id}
                  className="hover:shadow-soft transition-shadow cursor-pointer"
                  onClick={() => creative.property_id && navigate(`/editor/${creative.property_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {creative.exported_url ? (
                        <img src={creative.exported_url} alt={creative.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {creative.properties?.title ?? creative.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {FORMAT_LABELS[creative.format] ?? creative.format} • {relativeDate(creative.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          creative.status === "published" ? "default" :
                          creative.status === "scheduled" ? "secondary" : "outline"
                        }
                        className="text-xs shrink-0 ml-2"
                      >
                        {creative.status === "published" ? "Publicado" :
                         creative.status === "scheduled" ? "Agendado" : "Rascunho"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <TenantWorkspaceCard />
        <OnboardingChecklist />
        <UpgradePlannerCard />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
