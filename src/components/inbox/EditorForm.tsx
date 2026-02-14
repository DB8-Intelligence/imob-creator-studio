import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditorFormProps {
  title: string;
  description: string;
  cta: string;
  onChangeTitle: (val: string) => void;
  onChangeDescription: (val: string) => void;
  onChangeCta: (val: string) => void;
}

const EditorForm = ({
  title,
  description,
  cta,
  onChangeTitle,
  onChangeDescription,
  onChangeCta,
}: EditorFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prop-title">Título</Label>
        <Input
          id="prop-title"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="mt-1"
          placeholder="Título do imóvel"
        />
      </div>

      <div>
        <Label htmlFor="prop-description">Descrição</Label>
        <Textarea
          id="prop-description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="mt-1 min-h-[200px]"
          placeholder="Descrição detalhada do imóvel..."
          rows={8}
        />
      </div>

      <div>
        <Label htmlFor="prop-cta">CTA (Call to Action)</Label>
        <Input
          id="prop-cta"
          value={cta}
          onChange={(e) => onChangeCta(e.target.value)}
          className="mt-1"
          placeholder="Ex: Agende sua visita"
        />
      </div>
    </div>
  );
};

export default EditorForm;
