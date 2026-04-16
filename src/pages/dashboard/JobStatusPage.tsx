import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobStatusScreen from "@/components/jobs/JobStatusScreen";

export default function JobStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const table = searchParams.get("table") ?? "jobs";

  if (!jobId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Job ID nao encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        <div>
          <h1 className="text-xl font-bold text-[#002B5B]">Status do Processamento</h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe o progresso em tempo real.
          </p>
        </div>

        <JobStatusScreen
          jobId={jobId}
          table={table}
          onComplete={() => navigate("/dashboard")}
          onRetry={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
