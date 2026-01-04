const KEY = "carlys_pantry_v1";

function safeParse(s, fallback) {
  try {
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

export function getPantry() {
  if (typeof window === "undefined") return [];
  const items = safeParse(localStorage.getItem(KEY), []);
  return Array.isArray(items) ? items : [];
}

function savePantry(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addPantryItem(input) {
  const items = getPantry();

  const next = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: String(input?.name ?? "").trim(),
    qty: String(input?.qty ?? "").trim() || undefined,
    inStock: true, // true = What we have
    createdAt: Date.now(),
  };

  const updated = [next, ...items];
  savePantry(updated);
  return updated;
}

export function togglePantryItem(id) {
  const items = getPantry();
  const updated = items.map((it) =>
    it.id === id ? { ...it, inStock: !it.inStock } : it
  );
  savePantry(updated);
  return updated;
}

export function deletePantryItem(id) {
  const items = getPantry();
  const updated = items.filter((it) => it.id !== id);
  savePantry(updated);
  return updated;
}

export function clearPantry() {
  savePantry([]);
  return [];
}

export function deleteManyPantryItems(ids) {
  const idSet = new Set((ids || []).map(String));
  const items = getPantry();
  const updated = items.filter((it) => !idSet.has(String(it.id)));
  savePantry(updated);
  return updated;
}

export function updatePantryItemImage(id, dataUrl) {
  const items = getPantry();
  const updated = items.map((it) =>
    it.id === id ? { ...it, image: dataUrl } : it
  );
  savePantry(updated);
  return updated;
}

/**
 * ✅ NEW:
 * Add ingredient names into Grocery List ("What we need") by creating pantry items with inStock=false.
 * If an item already exists, it is forced to inStock=false (need).
 */
export function addIngredientsToGroceryList(ingredientNames) {
  const incoming = (ingredientNames || [])
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .map((x) => x.replace(/^[-•\u2022]\s*/, "").trim())
    .filter(Boolean);

  if (!incoming.length) return getPantry();

  const items = getPantry();

  const byName = new Map();
  items.forEach((it) => {
    const key = String(it.name || "").trim().toLowerCase();
    if (key) byName.set(key, it);
  });

  let changed = false;
  const updated = [...items];

  for (const name of incoming) {
    const key = name.toLowerCase();
    const existing = byName.get(key);

    if (existing) {
      if (existing.inStock !== false) {
        existing.inStock = false; // move to "need"
        changed = true;
      }
    } else {
      const next = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name,
        qty: undefined,
        inStock: false,
        createdAt: Date.now(),
      };
      updated.unshift(next);
      byName.set(key, next);
      changed = true;
    }
  }

  if (changed) savePantry(updated);
  return updated;
}
