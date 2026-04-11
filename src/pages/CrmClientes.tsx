/**
 * CrmClientes.tsx — Clients list page with table, search, filters, CSV import
 * Route: /crm/clientes
 */
import React, { useState, useMemo } from "react";
import { Plus, Search, Users, ShoppingCart, Building, Key, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClienteDrawer from "@/components/crm/ClienteDrawer";
import ImportacaoCSVModal from "@/components/crm/ImportacaoCSVModal";
import { useClientes, useCreateCliente, useDeleteCliente } from "@/hooks/useCrmClientes";
import type { CrmCliente, ClienteTipo, CreateClienteInput } from "@/types/crm";
import { CLIENTE_TIPO_CONFIG } from "@/types/crm";

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

const CrmClientes: React.FC = () => {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<ClienteTipo | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<CrmCliente | null>(null);
  const [isNewCliente, setIsNewCliente] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const { data: clientes = [], isLoading } = useClientes(
    search || undefined,
    tipoFilter === "all" ? undefined : tipoFilter
  );
  const createCliente = useCreateCliente();
  const deleteCliente = useDeleteCliente();

  // Stats
  const stats = useMemo(() => {
    const total = clientes.length;
    const compradores = clientes.filter((c) => c.tipo === "comprador").length;
    const vendedores = clientes.filter((c) => c.tipo === "vendedor").length;
    const locatarios = clientes.filter((c) => c.tipo === "locatario").length;
    return { total, compradores, vendedores, locatarios };
  }, [clientes]);

  const handleRowClick = (cliente: CrmCliente) => {
    setSelectedCliente(cliente);
    setIsNewCliente(false);
    setDrawerOpen(true);
  };

  const handleNewCliente = () => {
    setSelectedCliente(null);
    setIsNewCliente(true);
    setDrawerOpen(true);
  };

  const handleSaveNew = (data: CreateClienteInput) => {
    createCliente.mutate(data);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCsvModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Importar CSV
          </Button>
          <Button onClick={handleNewCliente}>
            <Plus className="h-4 w-4 mr-1" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-emerald-500/10"><ShoppingCart className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.compradores}</p>
              <p className="text-xs text-muted-foreground">Compradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-purple-500/10"><Building className="h-5 w-5 text-purple-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.vendedores}</p>
              <p className="text-xs text-muted-foreground">Vendedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-orange-500/10"><Key className="h-5 w-5 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.locatarios}</p>
              <p className="text-xs text-muted-foreground">Locatarios</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF, email..."
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as ClienteTipo | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(CLIENTE_TIPO_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Negocios</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => {
                const tipoCfg = CLIENTE_TIPO_CONFIG[cliente.tipo];
                return (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(cliente)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {cliente.foto_url ? (
                            <img src={cliente.foto_url} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            getInitials(cliente.nome)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground">{cliente.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tipoCfg.color}>{tipoCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{cliente.telefone || "-"}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{cliente.total_negocios}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-emerald-600">
                      {cliente.valor_total_negocios > 0 ? formatCurrency(cliente.valor_total_negocios) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Drawers / Modals */}
      <ClienteDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        cliente={selectedCliente}
        isNew={isNewCliente}
        onSaveNew={handleSaveNew}
      />
      <ImportacaoCSVModal open={csvModalOpen} onOpenChange={setCsvModalOpen} />
    </div>
  );
};

export default CrmClientes;
