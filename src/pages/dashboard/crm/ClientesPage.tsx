/**
 * ClientesPage.tsx — Client listing table with search + create modal
 * Route: /dashboard/crm/clientes
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Users,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone_mobile: string | null;
  company: string | null;
  status: string;
  created_at: string;
}

// ── Data hooks ───────────────────────────────────────────────────────────────

function useClients() {
  const { workspaceId } = useWorkspaceContext();
  return useQuery<Client[]>({
    queryKey: ["clients", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("workspace_id", workspaceId as string)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Client[];
    },
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

function useCreateClient() {
  const { workspaceId } = useWorkspaceContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email?: string;
      phone_mobile?: string;
      company?: string;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          workspace_id: workspaceId,
          name: input.name,
          email: input.email || null,
          phone_mobile: input.phone_mobile || null,
          company: input.company || null,
          status: "ativo",
        } as Record<string, unknown>)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients", workspaceId] });
      toast({ title: "Cliente criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar cliente", description: err.message, variant: "destructive" });
    },
  });
}

// ── Status badge color ───────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case "ativo":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "inativo":
      return "bg-gray-400/10 text-gray-500 border-gray-400/20";
    case "prospecto":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "bg-gray-400/10 text-gray-500 border-gray-400/20";
  }
}

// ── New Client Dialog ────────────────────────────────────────────────────────

function NovoClienteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createClient = useCreateClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_mobile: "",
    company: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    createClient.mutate(form, {
      onSuccess: () => {
        onClose();
        setForm({ name: "", email: "", phone_mobile: "", company: "" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-white font-['Plus_Jakarta_Sans']">
        <DialogHeader>
          <DialogTitle className="text-[#002B5B]">Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={form.phone_mobile}
              onChange={(e) => set("phone_mobile", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <Label>Empresa</Label>
            <Input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Imobiliaria XYZ"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim() || createClient.isPending}
            className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
          >
            {createClient.isPending ? "Salvando..." : "Criar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const { data: clients = [], isLoading } = useClients();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone_mobile?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <AppLayout>
      <div className="space-y-6 font-['Plus_Jakarta_Sans'] max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">Clientes</h1>
            <p className="text-sm text-gray-500">
              {clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="pl-9 w-56"
              />
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#002B5B]/5 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[#002B5B]/40" />
              </div>
              <h3 className="text-lg font-semibold text-[#002B5B] mb-1">
                {search ? "Nenhum resultado" : "Nenhum cliente cadastrado"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {search
                  ? "Tente buscar com outros termos."
                  : "Cadastre seu primeiro cliente para comecar."}
              </p>
              {!search && (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60">
                  <TableHead className="text-[#002B5B] font-semibold">Nome</TableHead>
                  <TableHead className="text-[#002B5B] font-semibold">Empresa</TableHead>
                  <TableHead className="text-[#002B5B] font-semibold">WhatsApp</TableHead>
                  <TableHead className="text-[#002B5B] font-semibold">E-mail</TableHead>
                  <TableHead className="text-[#002B5B] font-semibold">Status</TableHead>
                  <TableHead className="text-[#002B5B] font-semibold">Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50/40">
                    <TableCell className="font-medium text-[#002B5B]">{client.name}</TableCell>
                    <TableCell className="text-gray-600">{client.company || "--"}</TableCell>
                    <TableCell className="text-gray-600">{client.phone_mobile || "--"}</TableCell>
                    <TableCell className="text-gray-600">{client.email || "--"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${statusBadge(client.status)}`}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <NovoClienteDialog open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppLayout>
  );
}
