import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import { useImport, type ImportPlatform } from "@/hooks/useImport";

const PLATFORMS = [
  { id: "tecimob", name: "Tecimob", desc: "XML de imóveis + CSV de clientes" },
  { id: "jetimob", name: "Jetimob", desc: "XML de imóveis" },
  { id: "univen", name: "Univen", desc: "XML + CSV clientes e leads" },
  { id: "buscaimo", name: "Buscaimo", desc: "XML VRSync padrão" },
  { id: "generic", name: "Genérico", desc: "XML VRSync ou CSV padrão" },
];

export default function ImportPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [platform, setPlatform] = useState<ImportPlatform>("generic");
  const [file, setFile] = useState<File | null>(null);
  const {
    uploading, parsing, importing, progress, preview, status,
    uploadFile, parseFile, confirmImport, reset,
  } = useImport();

  const handleFile = (f: File) => {
    setFile(f);
  };

  const handleParse = async () => {
    if (!file) return;
    const path = await uploadFile(file);
    await parseFile(path, platform);
    setStep(3);
  };

  const handleConfirm = async () => {
    await confirmImport();
    setStep(4);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Importar dados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Migre imóveis, clientes e leads de outra plataforma para o ImobCreator
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: "Origem" },
            { n: 2, label: "Arquivo" },
            { n: 3, label: "Preview" },
            { n: 4, label: "Concluído" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= n ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {step > n ? "✓" : n}
              </div>
              <span className={`text-sm ${step >= n ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
              {n < 4 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Choose platform */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-medium">De qual plataforma você está migrando?</h2>
            <div className="grid grid-cols-1 gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id}
                  onClick={() => { setPlatform(p.id as ImportPlatform); setStep(2); }}
                  className={`flex items-center justify-between p-4 border rounded-xl text-left transition-colors
                    ${platform === p.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  </div>
                  {platform === p.id && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Upload file */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-medium">Faça upload do arquivo exportado</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Arraste o arquivo ou clique para selecionar</p>
              <p className="text-xs text-gray-400">Suporta: .xml, .csv, .zip</p>
              <input type="file" accept=".xml,.csv,.zip"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden" id="import-file" />
              <label htmlFor="import-file">
                <Button variant="outline" className="mt-4" asChild><span>Selecionar arquivo</span></Button>
              </label>
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <Button onClick={handleParse} disabled={uploading || parsing}>
                  {(uploading || parsing)
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
                    : "Analisar arquivo"
                  }
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Preview */}
        {step === 3 && preview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Preview da importação</h2>
              <Badge className="bg-blue-100 text-blue-700">{preview.total} registros</Badge>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
              {preview.preview.map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-3 text-xs border border-gray-100">
                  <p className="font-medium text-gray-800">
                    {(item.reference || item.title || item.name || `Registro ${i + 1}`) as string}
                  </p>
                  {item.price && <p className="text-gray-500">R$ {Number(item.price).toLocaleString("pt-BR")}</p>}
                  {item.address && (
                    <p className="text-gray-500">
                      {(item.address as Record<string, string>).bairro} · {(item.address as Record<string, string>).cidade}
                    </p>
                  )}
                  {item.photos && <p className="text-gray-400">{(item.photos as string[]).length} fotos</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { reset(); setStep(1); }}>Cancelar</Button>
              <Button onClick={handleConfirm} className="flex-1">
                Confirmar importação de {preview.total} registros
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Progress / Done */}
        {step === 4 && (
          <div className="space-y-4 text-center py-8">
            {status === "processing" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="font-medium">Importando dados...</p>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500">{progress}% concluído</p>
              </>
            )}
            {status === "done" && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-xl font-bold">Importação concluída!</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => { reset(); setStep(1); }}>Nova importação</Button>
                  <Button onClick={() => window.location.href = "/imoveis"}>Ver imóveis</Button>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-xl font-bold">Erro na importação</p>
                <Button onClick={() => { reset(); setStep(1); }}>Tentar novamente</Button>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
