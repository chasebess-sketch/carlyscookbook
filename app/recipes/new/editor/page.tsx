"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RECIPE_TEMPLATES, TemplateField } from "@/lib/recipeTemplates";
import { createRecipe } from "@/lib/recipesStore";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

export default function RecipeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "classic";

  const template = useMemo(() => {
    return (
      RECIPE_TEMPLATES.find((t) => t.id === templateId) ?? RECIPE_TEMPLATES[0]
    );
  }, [templateId]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [ingredientLines, setIngredientLines] = useState<string[]>([""]);

  // Reset form when template changes
  useEffect(() => {
    const init: Record<string, string> = {};
    template.fields.forEach((f) => {
      init[f.key] = "";
    });
    setValues(init);
    setIngredientLines([""]);
  }, [template]);

  const setField = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const setIngredientLine = (idx: number, val: string) => {
    setIngredientLines((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addIngredientLine = () => setIngredientLines((prev) => [...prev, ""]);

  const removeIngredientLine = (idx: number) => {
    setIngredientLines((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next.length ? next : [""];
    });
  };

  const onSave = () => {
    const title = (values.title || "").trim();
    if (!title) {
      alert("Please add a recipe title 🙂");
      return;
    }

    const data: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.key === "ingredients") {
        const joined = ingredientLines
          .map((x) => x.trim())
          .filter(Boolean)
          .join("\n");
        data[f.key] = joined;
      } else {
        data[f.key] = (values[f.key] ?? "").toString();
      }
    });

    createRecipe({
      title,
      templateId: template.id,
      data,
    });

    router.push("/recipes");
  };

  return (
    <div
      className="relative min-h-[100svh] bg-cover bg-center"
      style={{ backgroundImage: "url('/menu-closed.png')" }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Back (true top-left) */}
      <div className="absolute left-4 top-4 z-20 md:left-6 md:top-6">
        <Link
          href="/recipes/new"
          className="select-none text-2xl font-semibold text-white drop-shadow hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont }}
        >
          Back
        </Link>
      </div>

      {/* MAIN LAYOUT
          - Mobile: stacked (sidebar top, paper below)
          - Desktop: 2 columns
      */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-20 md:flex-row md:gap-8 md:px-6 md:pt-12">
        {/* TOP/LEFT: sidebar */}
        <div className="w-full md:max-w-sm md:pt-0">
          <h1
            className="text-center text-4xl font-semibold text-white drop-shadow md:text-left"
            style={{ fontFamily: handFont }}
          >
            {template.name}
          </h1>

          <p className="mt-2 text-center text-white/90 drop-shadow md:text-left">
            {template.description}
          </p>

          {/* Buttons: side-by-side on mobile, stacked on desktop */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
            <button
              className="w-full rounded-2xl bg-white/90 px-5 py-3 text-lg font-semibold shadow hover:bg-white"
              style={{ fontFamily: handFont }}
              onClick={onSave}
            >
              Save Recipe
            </button>

            <button
              className="w-full rounded-2xl bg-white/70 px-5 py-3 text-lg font-semibold shadow hover:bg-white/90"
              style={{ fontFamily: handFont }}
              onClick={() => router.push("/recipes/new")}
            >
              Change Template
            </button>
          </div>
        </div>

        {/* BOTTOM/RIGHT: paper editor */}
        <div className="flex w-full flex-1 items-start justify-center md:justify-end">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div
              className="mb-4 text-3xl font-semibold text-black"
              style={{ fontFamily: handFont }}
            >
              Fill in your recipe
            </div>

            <div className="space-y-5">
              {template.fields.map((f: TemplateField) => (
                <div key={f.key}>
                  <label className="mb-2 block text-sm font-semibold text-black/80">
                    {f.label}
                  </label>

                  {/* Special Ingredients Editor (responsive line-by-line + plus button) */}
                  {f.key === "ingredients" ? (
                    <div className="space-y-2">
                      {ingredientLines.map((line, idx) => {
                        const isLast = idx === ingredientLines.length - 1;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                          >
                            <input
                              value={line}
                              onChange={(e) => setIngredientLine(idx, e.target.value)}
                              className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                              placeholder={`Ingredient ${idx + 1}`}
                            />

                            {/* Buttons: below input on mobile, to the right on desktop */}
                            <div className="flex gap-2 sm:gap-2">
                              {/* plus */}
                              {isLast ? (
                                <button
                                  type="button"
                                  onClick={addIngredientLine}
                                  className="h-[46px] w-[46px] shrink-0 rounded-xl border border-black/15 bg-black/5 text-xl font-bold text-black/70 hover:bg-black/10"
                                  aria-label="Add ingredient line"
                                >
                                  +
                                </button>
                              ) : (
                                // keep spacing consistent on desktop without “stealing” space on mobile
                                <div className="hidden h-[46px] w-[46px] shrink-0 sm:block" />
                              )}

                              {/* remove */}
                              <button
                                type="button"
                                onClick={() => removeIngredientLine(idx)}
                                disabled={ingredientLines.length <= 1}
                                className="h-[46px] w-[46px] shrink-0 rounded-xl border border-black/15 bg-black/5 text-lg font-bold text-black/50 hover:bg-black/10 disabled:opacity-30"
                                aria-label="Remove ingredient line"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="text-xs text-black/50">
                        Tip: Each line counts as one ingredient (helps searching later).
                      </div>
                    </div>
                  ) : f.type === "text" ? (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
