import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  BlockType,
  LayoutBlock,
  LayoutConfig,
  LayoutScope,
  LayoutTemplateRow,
  UserLayoutRow,
  AdminLayoutRow,
} from "@/types/layout";

const LS_PREFIX = "layout_editor_backup_v1";
const AUTOSAVE_DEBOUNCE_MS = 2000;

function lsKey(scope: LayoutScope, targetId: string) {
  return `${LS_PREFIX}:${scope}:${targetId}`;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function reindex(blocks: LayoutBlock[]): LayoutBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }));
}

export interface UseLayoutEditorOptions {
  scope: LayoutScope;
  targetId: string;
  isAdminMode?: boolean;
}

export interface UseLayoutEditorReturn {
  layout: LayoutConfig;
  isLoading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  error: string | null;
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
  addBlock: (type: BlockType, afterId?: string) => void;
  removeBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  updateBlockProps: (id: string, props: Record<string, unknown>) => void;
  toggleBlockVisibility: (id: string) => void;
  toggleBlockLock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  saveLayout: () => Promise<void>;
  publishLayout: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  resetToTemplate: () => Promise<void>;
}

const emptyLayout = (scope: LayoutScope): LayoutConfig => ({
  id: "",
  scope,
  blocks: [],
});

export function useLayoutEditor(options: UseLayoutEditorOptions): UseLayoutEditorReturn {
  const { scope, targetId, isAdminMode = false } = options;

  const [layout, setLayout] = useState<LayoutConfig>(() => emptyLayout(scope));
  const [originalLayout, setOriginalLayout] = useState<LayoutConfig>(() => emptyLayout(scope));
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(layout.blocks) !== JSON.stringify(originalLayout.blocks),
    [layout.blocks, originalLayout.blocks]
  );

  // ---------- initial load ----------
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Try localStorage backup first (offline resilience)
        const backup = typeof window !== "undefined" ? window.localStorage.getItem(lsKey(scope, targetId)) : null;

        // 2. Load from DB
        if (isAdminMode) {
          const adminScope = scope === "dashboard_user" ? "dashboard_global" : scope;
          const { data, error: dbErr } = await supabase
            .from("admin_layouts")
            .select("*")
            .eq("scope", adminScope)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (dbErr) throw dbErr;

          const row = data as AdminLayoutRow | null;
          const loaded: LayoutConfig = {
            id: row?.id ?? "",
            scope,
            blocks: reindex(row?.blocks ?? []),
          };
          if (cancelled) return;
          setOriginalLayout(loaded);
          setLayout(backup ? JSON.parse(backup) : loaded);
        } else {
          const { data, error: dbErr } = await supabase
            .from("user_layouts")
            .select("*")
            .eq("scope", scope)
            .eq("user_id", targetId)
            .maybeSingle();
          if (dbErr) throw dbErr;

          const row = data as UserLayoutRow | null;

          // If no user layout exists, try to clone the default template
          if (!row) {
            const { data: tpl } = await supabase
              .from("layout_templates")
              .select("*")
              .eq("scope", scope)
              .eq("is_default", true)
              .eq("is_system", true)
              .maybeSingle();
            const tplRow = tpl as LayoutTemplateRow | null;
            const loaded: LayoutConfig = {
              id: "",
              scope,
              blocks: reindex(tplRow?.blocks ?? []),
            };
            if (cancelled) return;
            setTemplateId(tplRow?.id ?? null);
            setOriginalLayout(loaded);
            setLayout(backup ? JSON.parse(backup) : loaded);
          } else {
            const loaded: LayoutConfig = {
              id: row.id,
              scope,
              blocks: reindex(row.blocks ?? []),
            };
            if (cancelled) return;
            setTemplateId(row.template_id);
            setOriginalLayout(loaded);
            setLayout(backup ? JSON.parse(backup) : loaded);
          }
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scope, targetId, isAdminMode]);

  // ---------- autosave to localStorage (debounced) ----------
  useEffect(() => {
    if (!isDirty || typeof window === "undefined") return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      window.localStorage.setItem(lsKey(scope, targetId), JSON.stringify(layout));
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [layout, isDirty, scope, targetId]);

  const clearBackup = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(lsKey(scope, targetId));
  }, [scope, targetId]);

  // ---------- block mutations ----------
  const addBlock = useCallback((type: BlockType, afterId?: string) => {
    setLayout((prev) => {
      const newBlock: LayoutBlock = {
        id: uuid(),
        type,
        order: 0,
        visible: true,
        locked: false,
        props: {},
      };
      const blocks = [...prev.blocks];
      if (afterId) {
        const idx = blocks.findIndex((b) => b.id === afterId);
        if (idx >= 0) blocks.splice(idx + 1, 0, newBlock);
        else blocks.push(newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { ...prev, blocks: reindex(blocks) };
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setLayout((prev) => ({ ...prev, blocks: reindex(prev.blocks.filter((b) => b.id !== id)) }));
    setSelectedBlockId((curr) => (curr === id ? null : curr));
  }, []);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setLayout((prev) => {
      if (fromIndex === toIndex) return prev;
      const blocks = [...prev.blocks];
      if (fromIndex < 0 || fromIndex >= blocks.length) return prev;
      if (toIndex < 0 || toIndex >= blocks.length) return prev;
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { ...prev, blocks: reindex(blocks) };
    });
  }, []);

  const updateBlockProps = useCallback((id: string, props: Record<string, unknown>) => {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...props } } : b)),
    }));
  }, []);

  const toggleBlockVisibility = useCallback((id: string) => {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    }));
  }, []);

  const toggleBlockLock = useCallback((id: string) => {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, locked: !b.locked } : b)),
    }));
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setLayout((prev) => {
      const idx = prev.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const source = prev.blocks[idx];
      const copy: LayoutBlock = {
        ...source,
        id: uuid(),
        props: { ...source.props },
        style: source.style ? { ...source.style } : undefined,
      };
      const blocks = [...prev.blocks];
      blocks.splice(idx + 1, 0, copy);
      return { ...prev, blocks: reindex(blocks) };
    });
  }, []);

  // ---------- persistence ----------
  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (isAdminMode) {
        const adminScope = scope === "dashboard_user" ? "dashboard_global" : scope;
        const payload = {
          scope: adminScope,
          name: `${adminScope} layout`,
          blocks: layout.blocks,
        };
        if (layout.id) {
          const { error: dbErr } = await supabase
            .from("admin_layouts")
            .update({ blocks: layout.blocks })
            .eq("id", layout.id);
          if (dbErr) throw dbErr;
        } else {
          const { data, error: dbErr } = await supabase
            .from("admin_layouts")
            .insert(payload)
            .select()
            .single();
          if (dbErr) throw dbErr;
          setLayout((prev) => ({ ...prev, id: (data as AdminLayoutRow).id }));
        }
      } else {
        const { data, error: dbErr } = await supabase
          .from("user_layouts")
          .upsert(
            {
              user_id: targetId,
              scope,
              template_id: templateId,
              blocks: layout.blocks,
            },
            { onConflict: "user_id,scope" }
          )
          .select()
          .single();
        if (dbErr) throw dbErr;
        const row = data as UserLayoutRow;
        setLayout((prev) => ({ ...prev, id: row.id }));
      }
      setOriginalLayout(layout);
      clearBackup();
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [isAdminMode, layout, scope, targetId, templateId, clearBackup]);

  const publishLayout = useCallback(async () => {
    setIsPublishing(true);
    setError(null);
    try {
      if (isAdminMode) {
        const adminScope = scope === "dashboard_user" ? "dashboard_global" : scope;
        // ensure saved first
        if (!layout.id || isDirty) {
          await saveLayout();
        }
        // deactivate siblings, activate this one
        const { error: deactErr } = await supabase
          .from("admin_layouts")
          .update({ is_active: false })
          .eq("scope", adminScope)
          .neq("id", layout.id);
        if (deactErr) throw deactErr;

        const { error: actErr } = await supabase
          .from("admin_layouts")
          .update({ is_active: true, activated_at: new Date().toISOString() })
          .eq("id", layout.id);
        if (actErr) throw actErr;
      } else {
        if (!layout.id || isDirty) {
          await saveLayout();
        }
        const { error: dbErr } = await supabase
          .from("user_layouts")
          .update({ is_published: true, published_at: new Date().toISOString() })
          .eq("user_id", targetId)
          .eq("scope", scope);
        if (dbErr) throw dbErr;
      }
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsPublishing(false);
    }
  }, [isAdminMode, layout.id, isDirty, saveLayout, scope, targetId]);

  const loadTemplate = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const { data, error: dbErr } = await supabase
          .from("layout_templates")
          .select("*")
          .eq("id", id)
          .single();
        if (dbErr) throw dbErr;
        const row = data as LayoutTemplateRow;
        setTemplateId(row.id);
        setLayout((prev) => ({ ...prev, blocks: reindex(row.blocks ?? []) }));
      } catch (e) {
        setError((e as Error).message);
        throw e;
      }
    },
    []
  );

  const resetToTemplate = useCallback(async () => {
    if (!templateId) return;
    await loadTemplate(templateId);
    clearBackup();
  }, [templateId, loadTemplate, clearBackup]);

  return {
    layout,
    isLoading,
    isDirty,
    isSaving,
    isPublishing,
    error,
    selectedBlockId,
    selectBlock: setSelectedBlockId,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockProps,
    toggleBlockVisibility,
    toggleBlockLock,
    duplicateBlock,
    saveLayout,
    publishLayout,
    loadTemplate,
    resetToTemplate,
  };
}
