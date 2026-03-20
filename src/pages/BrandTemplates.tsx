import { useState } from "react";
import InboxLayout from "@/components/inbox/InboxLayout";
import TemplateTable from "@/components/brand/TemplateTable";
import TemplateFormModal from "@/components/brand/TemplateFormModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/useBrandTemplates";
import type { BrandTemplate, BrandTemplateInput } from "@/types/brandTemplate";
import { Plus, Palette } from "lucide-react";

const BrandTemplatesPage = () => {
  const { data: templates, isLoading, isError } = useBrandTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BrandTemplate | null>(null);

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (t: BrandTemplate) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleSubmit = (data: BrandTemplateInput) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data }, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <InboxLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus brand kits para artes dentro do workspace ativo
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" /> Novo Template
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-destructive">
            Erro ao carregar templates. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && templates?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <Palette className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">Nenhum template criado</p>
            <p className="text-xs mt-1">Crie seu primeiro brand kit para começar a gerar artes personalizadas.</p>
            <p className="text-xs mt-3 max-w-md">Esse é o passo que ajuda a padronizar sua operação e reduzir retrabalho visual em cada novo imóvel.</p>
            <Button className="mt-4" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-1" /> Criar Template
            </Button>
          </div>
        )}

        {!isLoading && !isError && templates && templates.length > 0 && (
          <TemplateTable
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeletingId={deleteMutation.isPending ? (deleteMutation.variables as string) : null}
          />
        )}

        <TemplateFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          initial={editing}
        />
      </div>
    </InboxLayout>
  );
};

export default BrandTemplatesPage;
