import { useState } from "react";
import InboxLayout from "@/components/inbox/InboxLayout";
import FiltersBar from "@/components/inbox/FiltersBar";
import PropertyCard from "@/components/inbox/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox as InboxIcon } from "lucide-react";
import { useInboxProperties, useUpdatePropertyStatus } from "@/hooks/useInboxProperties";
import type { PropertyStatus } from "@/components/inbox/StatusBadge";
import ApiErrorBanner from "@/components/inbox/ApiErrorBanner";

const InboxPage = () => {
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const { data: properties, isLoading, isError, error, refetch, isRefetching } = useInboxProperties();
  const updateStatus = useUpdatePropertyStatus();

  const filtered =
    filter === "all"
      ? properties
      : properties?.filter((p) => p.status === filter);

  return (
    <InboxLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Imóveis recebidos via WhatsApp
          </p>
        </div>

        <FiltersBar active={filter} onChange={setFilter} />

        {isError && (
          <ApiErrorBanner
            error={error as Error}
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && !isError && filtered?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <InboxIcon className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">Nenhum imóvel recebido ainda</p>
            <p className="text-xs mt-1">Quando novos imóveis chegarem via WhatsApp, eles aparecerão aqui.</p>
          </div>
        )}

        {!isLoading && !isError && filtered && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </InboxLayout>
  );
};

export default InboxPage;
