import { Quote } from "lucide-react";
import type { TemaProps } from "../tipos";

export default function UrbanoDepoimentos({ depoimentos }: TemaProps) {
  const items =
    depoimentos.length > 0
      ? depoimentos.filter((d) => d.ativo)
      : [
          {
            id: "d1",
            nome_cliente: "Roberto Mendes",
            texto: "Profissionalismo de altissimo nivel. Encontrou exatamente o que eu precisava para minha empresa.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Compra comercial",
          },
          {
            id: "d2",
            nome_cliente: "Luciana Ferreira",
            texto: "Atendimento tecnico e preciso. Me senti segura durante toda a negociacao.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Compra residencial",
          },
          {
            id: "d3",
            nome_cliente: "Carlos Eduardo",
            texto: "Vendeu meu imovel em tempo recorde e pelo valor que eu esperava. Excelente trabalho.",
            avaliacao: 5,
            foto_url: "",
            tipo_negocio: "Venda",
          },
        ];

  return (
    <section className="bg-[#F3F4F6] px-4 py-16 md:px-8" id="depoimentos">
      <div className="mx-auto max-w-5xl">
        <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wider text-[#64748B]">
          Depoimentos
        </p>
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-800 md:text-3xl">
          A confianca dos nossos clientes
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((dep) => (
            <div
              key={dep.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-[#64748B]"
            >
              <Quote className="mb-3 h-6 w-6 text-gray-300" />
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                {dep.texto}
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {dep.foto_url ? (
                  <img
                    src={dep.foto_url}
                    alt={dep.nome_cliente}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#374151] text-xs font-bold text-white">
                    {dep.nome_cliente?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {dep.nome_cliente}
                  </p>
                  {dep.tipo_negocio && (
                    <p className="text-xs text-gray-400">{dep.tipo_negocio}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
