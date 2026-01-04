export type SavedRecipe = {
  id: string;
  title: string;
  templateId: string;
  data: Record<string, string>;
  createdAt: number;
  updatedAt?: number;
};

const KEY = "carlys_recipes_v1";

function safeParse<T>(s: string | null, fallback: T): T {
  try {
    if (!s) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function saveAll(recipes: SavedRecipe[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(recipes));
}

export function getAllRecipes(): SavedRecipe[] {
  if (typeof window === "undefined") return [];
  const items = safeParse<SavedRecipe[]>(localStorage.getItem(KEY), []);
  return Array.isArray(items) ? items : [];
}

export function getRecipeById(id: string): SavedRecipe | null {
  const all = getAllRecipes();
  return all.find((r) => r.id === id) ?? null;
}

export function createRecipe(input: {
  title: string;
  templateId: string;
  data: Record<string, string>;
}): SavedRecipe {
  const all = getAllRecipes();

  const next: SavedRecipe = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: String(input.title || "").trim(),
    templateId: String(input.templateId || "").trim(),
    data: input.data || {},
    createdAt: Date.now(),
  };

  const updated = [next, ...all];
  saveAll(updated);
  return next;
}

export function updateRecipe(
  id: string,
  patch: Partial<Pick<SavedRecipe, "title" | "templateId" | "data">>
): SavedRecipe | null {
  const all = getAllRecipes();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const current = all[idx];
  const next: SavedRecipe = {
    ...current,
    ...patch,
    title: patch.title !== undefined ? String(patch.title).trim() : current.title,
    templateId:
      patch.templateId !== undefined ? String(patch.templateId).trim() : current.templateId,
    data: patch.data !== undefined ? patch.data : current.data,
    updatedAt: Date.now(),
  };

  const updated = [...all];
  updated[idx] = next;
  saveAll(updated);
  return next;
}
