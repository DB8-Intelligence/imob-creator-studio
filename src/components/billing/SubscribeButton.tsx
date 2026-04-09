import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CreditCard } from "lucide-react";
import { useAsaasSubscription } from "@/hooks/useAsaasSubscription";

interface SubscribeButtonProps {
  moduleId: string;
  planSlug: string;
  planName: string;
  price: number;
  className?: string;
}

export function SubscribeButton({
  moduleId,
  planSlug,
  planName,
  price,
  className,
}: SubscribeButtonProps) {
  const [open, setOpen] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const { subscribe, loading, error } = useAsaasSubscription();

  const handleConfirm = async () => {
    const result = await subscribe(moduleId, planSlug, cpfCnpj);
    if (result) {
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className}>
        <CreditCard className="h-4 w-4 mr-2" />
        Assinar {planName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assinar {planName}</DialogTitle>
            <DialogDescription>
              Você será redirecionado para o checkout seguro do Asaas. Pode
              pagar via Pix, boleto ou cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{planName}</span>
              <span className="font-bold text-lg">
                R${price.toFixed(2).replace(".", ",")}/mês
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                value={cpfCnpj}
                onChange={(e) =>
                  setCpfCnpj(e.target.value.replace(/\D/g, ""))
                }
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Necessário para emissão de nota fiscal
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Aguarde...
                  </>
                ) : (
                  "Ir para pagamento"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
