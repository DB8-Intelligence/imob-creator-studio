const STORAGE_KEY = "imob_saved_prompts";

export interface SavedPrompt {
  id: string;
  style: string;
  model_family: string;
  confidence: string;
  final_prompt: string;
  probable_prompt: string;
  negative_prompt: string;
  cta: string;
  savedAt: string;
  label?: string;
}

export function useSavedPrompts() {
  const getAll = (): SavedPrompt[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const save = (data: Omit<SavedPrompt, "id" | "savedAt">): SavedPrompt => {
    const all = getAll();
    const entry: SavedPrompt = {
      ...data,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...all]));
    return entry;
  };

  const remove = (id: string): void => {
    const filtered = getAll().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  const count = (): number => getAll().length;

  return { getAll, save, remove, count };
}
