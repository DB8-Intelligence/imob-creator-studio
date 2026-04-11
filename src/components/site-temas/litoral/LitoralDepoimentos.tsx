import { Star } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function LitoralDepoimentos({ site, depoimentos }: TemaProps) {
  const sand = "#D97706";

  const items =
    depoimentos.length > 0
      ? depoimentos.filter((d) => d.ativo)
      : [
          {
            id: "d1",
            nome_cliente: "Patricia Oliveira",
            texto: "Realizou o nosso sonho de ter uma casa na praia! Profissional incrivel e super atencioso.",
            avaliacao: 5,
            foto_url: "",
          },
          {
            id: "d2",
            nome_cliente: "Fernando Lima",
            texto: "Conhece cada canto do litoral. Nos mostrou opcoes que nunca teriamos encontrado sozinhos.",
            avaliacao: 5,
            foto_url: "",
          },
          {
            id: "d3",
            nome_cliente: "Camila Santos",
            texto: "Nosso apartamento frente-mar e um sonho realizado. Obrigada pela dedicacao!",
            avaliacao: 5,
            foto_url: "",
          },
        ];

  return (
    <section
      className="px-4 py-16 md:px-8"
      style={{ backgroundColor: "#FEF3C7" }}
      id="depoimentos"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl font-['Playfair_Display',serif]">
          Historias de Sucesso
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Clientes que encontraram seu lugar no paraiso
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((dep) => (
            <div
              key={dep.id}
              className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < (dep.avaliacao || 5) ? sand : "transparent"}
                    stroke={i < (dep.avaliacao || 5) ? sand : "#D1D5DB"}
                  />
                ))}
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-600 italic">
                &ldquo;{dep.texto}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                {dep.foto_url ? (
                  <img
                    src={dep.foto_url}
                    alt={dep.nome_cliente}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: sand }}
                  >
                    {dep.nome_cliente?.charAt(0) || "C"}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {dep.nome_cliente}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
