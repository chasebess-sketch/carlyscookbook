"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RECIPE_TEMPLATES } from "@/lib/recipeTemplates";
import { getRecipeById, updateRecipe, SavedRecipe } from "@/lib/recipesStore";
import { getPantry, addIngredientsToGroceryList } from "@/lib/pantryStore";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

function cleanIngredientLine(s: string) {
  return String(s || "")
    .trim()
    .replace(/^[-•\u2022]\s*/, "")
    .trim();
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [pantryTick, setPantryTick] = useState(0);

  useEffect(() => {
    const r = getRecipeById(id);
    setRecipe(r);
    if (r) setValues({ ...(r.data || {}), title: r.title });
  }, [id]);

  const template = useMemo(() => {
    if (!recipe) return RECIPE_TEMPLATES[0];
    return RECIPE_TEMPLATES.find((t) => t.id === recipe.templateId) ?? RECIPE_TEMPLATES[0];
  }, [recipe]);

  const templateName = useMemo(() => {
    if (!recipe) return "";
    return (
      RECIPE_TEMPLATES.find((t) => t.id === recipe.templateId)?.name ?? recipe.templateId
    );
  }, [recipe]);

  const pantryMap = useMemo(() => {
    // tick forces refresh after adding to grocery list
    pantryTick;
    const items = getPantry();
    const m = new Map<string, boolean>(); // nameLower -> inStock
    items.forEach((it: any) => {
      const key = String(it.name || "").trim().toLowerCase();
      if (key) m.set(key, !!it.inStock);
    });
    return m;
  }, [pantryTick]);

  const setField = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const onSave = () => {
    if (!recipe) return;

    const title = String(values.title || "").trim();
    if (!title) {
      alert("Please add a recipe title 🙂");
      return;
    }

    // persist all template keys
    const data: Record<string, string> = {};
    template.fields.forEach((f) => {
      data[f.key] = String(values[f.key] ?? "");
    });

    const updated = updateRecipe(recipe.id, { title, data });
    if (updated) {
      setRecipe(updated);
      setEditing(false);
    }
  };

  const onCancel = () => {
    if (!recipe) return;
    setEditing(false);
    setValues({ ...(recipe.data || {}), title: recipe.title });
  };

  const fields = useMemo(() => {
    return template.fields.filter((f) => f.key !== "title");
  }, [template]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-black/5 p-8">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-xl font-semibold">Recipe not found</div>
          <button
            className="mt-4 rounded-xl bg-black/5 px-4 py-2 font-semibold hover:bg-black/10"
            onClick={() => router.push("/recipes")}
          >
            Back to recipes
          </button>
        </div>
      </div>
    );
  }

  // Shared: renders the full fields list (view/edit), used in BOTH layouts
  const FieldsBlock = ({ compact }: { compact?: boolean }) => {
    return (
      <div className={compact ? "space-y-4" : "space-y-6"}>
        {fields.map((f) => {
          const v = String((editing ? values[f.key] : recipe.data?.[f.key]) ?? "");
          const isIngredients = f.key.toLowerCase().includes("ingredient");

          return (
            <div key={f.key}>
              <div
                className={`mb-2 font-semibold text-black/80 ${compact ? "text-xs" : "text-sm"}`}
              >
                {f.label}
              </div>

              {/* INGREDIENTS special render in view mode */}
              {!editing && isIngredients ? (
                <div className="space-y-2">
                  {(v || "")
                    .split("\n")
                    .map((line) => cleanIngredientLine(line))
                    .filter(Boolean)
                    .map((line) => {
                      const key = line.toLowerCase();
                      const status = pantryMap.has(key)
                        ? pantryMap.get(key)
                          ? "HAVE"
                          : "NEED"
                        : "ADD";

                      return (
                        <div
                          key={line}
                          className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                        >
                          <div className="font-semibold text-black">{line}</div>

                          {status === "HAVE" ? (
                            <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                              HAVE
                            </div>
                          ) : status === "NEED" ? (
                            <div className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold text-black/70">
                              NEED
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                addIngredientsToGroceryList([line]);
                                setPantryTick((t) => t + 1);
                              }}
                              className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                              style={{ fontFamily: handFont }}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}

                  {(v || "").trim() ? null : <div className="text-black/40">—</div>}
                </div>
              ) : (
                <>
                  {editing ? (
                    f.type === "text" ? (
                      <input
                        value={values[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                        placeholder={f.label}
                      />
                    ) : (
                      <textarea
                        value={values[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="w-full resize-none rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                        rows={f.rows ?? 6}
                        placeholder={f.label}
                      />
                    )
                  ) : (
                    <div className="rounded-xl border border-black/10 px-4 py-3 text-black/70">
                      {(v || "").trim() ? v : "—"}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/book-open.png')" }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Back (keep pinned + safe on all sizes) */}
      <div className="fixed left-4 top-4 z-50 md:left-6 md:top-6">
        <Link
          href="/recipes"
          className="select-none text-2xl font-semibold text-white drop-shadow hover:opacity-90"
          style={{ fontFamily: handFont }}
        >
          Back
        </Link>
      </div>

      {/* =========================
          MOBILE LAYOUT (single card)
          ========================= */}
      <div className="relative z-10 md:hidden">
        {/* Put the card lower into the book + keep scroll inside card */}
        <div className="mx-auto w-[92%] max-w-[560px] pt-24">
          <div className="rounded-[26px] bg-white/95 shadow-2xl backdrop-blur">
            {/* Header */}
            <div className="border-b border-black/10 p-5">
              <div
                className="text-3xl font-semibold text-black"
                style={{ fontFamily: handFont }}
              >
                {editing ? (
                  <input
                    value={values.title ?? ""}
                    onChange={(e) => setField("title", e.target.value)}
                    className="w-full rounded-xl border border-black/15 px-4 py-3 text-xl outline-none focus:border-black/30"
                    placeholder="Recipe title"
                  />
                ) : (
                  recipe.title
                )}
              </div>

              <div className="mt-2 text-sm text-black/60">
                Template: <span className="font-semibold">{templateName}</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
                    style={{ fontFamily: handFont }}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onSave}
                      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                      style={{ fontFamily: handFont }}
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancel}
                      className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
                      style={{ fontFamily: handFont }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Body scrolls */}
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <FieldsBlock compact />
              <div className="h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          DESKTOP / TABLET LAYOUT (two pages)
          ========================= */}
      <div className="relative z-10 hidden md:block">
        {/* This aligns content to the “white page” area */}
        <div className="absolute left-1/2 top-[56%] w-[92%] max-w-6xl -translate-x-1/2 -translate-y-1/2">
          {/* Fixed “book window” height; right side scrolls */}
          <div className="relative h-[560px]">
            {/* LEFT PAGE (title + buttons) */}
            <div className="absolute left-[30%] top-[48%] w-[380px] -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-[28px] bg-white/90 p-6 shadow-xl backdrop-blur">
                <div
                  className="text-4xl font-semibold text-black"
                  style={{ fontFamily: handFont }}
                >
                  {editing ? (
                    <input
                      value={values.title ?? ""}
                      onChange={(e) => setField("title", e.target.value)}
                      className="w-full rounded-xl border border-black/15 px-4 py-3 text-2xl outline-none focus:border-black/30"
                      placeholder="Recipe title"
                    />
                  ) : (
                    recipe.title
                  )}
                </div>

                <div className="mt-2 text-black/60">
                  Template: <span className="font-semibold">{templateName}</span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
                      style={{ fontFamily: handFont }}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onSave}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        style={{ fontFamily: handFont }}
                      >
                        Save
                      </button>
                      <button
                        onClick={onCancel}
                        className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
                        style={{ fontFamily: handFont }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-5 text-sm text-black/60">
                  Tip: The right page scrolls, so long recipes stay inside the book.
                </div>
              </div>
            </div>

            {/* RIGHT PAGE (recipe content, scrolls) */}
            <div className="absolute left-[74%] top-[48%] w-[420px] -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-[28px] bg-white/90 shadow-xl backdrop-blur">
                <div className="max-h-[520px] overflow-y-auto p-6">
                  <FieldsBlock />
                  <div className="h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* If the user has a very short screen height, allow scrolling the whole page too */}
        <div className="h-[100vh]" />
      </div>
    </div>
  );
}
