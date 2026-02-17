import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EditorFormData {
  title: string;
  description: string;
  cta: string;
  property_type: string;
  property_standard: string;
  state: string;
  city: string;
  neighborhood: string;
  investment_value: string;
  built_area_m2: string;
  highlights: string;
}

interface EditorFormProps {
  data: EditorFormData;
  onChange: (field: keyof EditorFormData, value: string) => void;
}

const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "lancamento", label: "Lançamento" },
  { value: "terreno", label: "Terreno" },
  { value: "oportunidade", label: "Oportunidade" },
];

const PROPERTY_STANDARDS = [
  { value: "economico", label: "Econômico" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
  { value: "luxo", label: "Luxo" },
];

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const EditorForm = ({ data, onChange }: EditorFormProps) => {
  return (
    <div className="space-y-4">
      {/* Tipo e Padrão */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo de Criativo *</Label>
          <Select value={data.property_type} onValueChange={(v) => onChange("property_type", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Padrão</Label>
          <Select value={data.property_standard} onValueChange={(v) => onChange("property_standard", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_STANDARDS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="prop-title">Título *</Label>
        <Input
          id="prop-title"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="mt-1"
          placeholder="Título do imóvel"
        />
      </div>

      {/* Estado, Cidade e Bairro */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Estado</Label>
          <Select value={data.state} onValueChange={(v) => onChange("state", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BR.map((uf) => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="prop-city">Cidade *</Label>
          <Input
            id="prop-city"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            className="mt-1"
            placeholder="Ex: São Paulo"
          />
        </div>
        <div>
          <Label htmlFor="prop-neighborhood">Bairro</Label>
          <Input
            id="prop-neighborhood"
            value={data.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            className="mt-1"
            placeholder="Ex: Alphaville"
          />
        </div>
      </div>

      {/* Valor e Área */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="prop-investment">Valor *</Label>
          <Input
            id="prop-investment"
            value={data.investment_value}
            onChange={(e) => onChange("investment_value", e.target.value)}
            className="mt-1"
            placeholder="Ex: 350000"
            type="number"
          />
        </div>
        <div>
          <Label htmlFor="prop-area">Área (m²) *</Label>
          <Input
            id="prop-area"
            value={data.built_area_m2}
            onChange={(e) => onChange("built_area_m2", e.target.value)}
            className="mt-1"
            placeholder="Ex: 120"
            type="number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="prop-description">Descrição</Label>
        <Textarea
          id="prop-description"
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="mt-1 min-h-[120px]"
          placeholder="Descrição detalhada do imóvel..."
          rows={5}
        />
      </div>

      <div>
        <Label htmlFor="prop-highlights">Diferenciais</Label>
        <Textarea
          id="prop-highlights"
          value={data.highlights}
          onChange={(e) => onChange("highlights", e.target.value)}
          className="mt-1"
          placeholder="Ex: Piscina, churrasqueira, 3 vagas..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="prop-cta">CTA (Call to Action)</Label>
        <Input
          id="prop-cta"
          value={data.cta}
          onChange={(e) => onChange("cta", e.target.value)}
          className="mt-1"
          placeholder="Ex: Agende sua visita"
        />
      </div>
    </div>
  );
};

export default EditorForm;
