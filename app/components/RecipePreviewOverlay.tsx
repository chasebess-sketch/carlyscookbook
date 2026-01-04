"use client";

import { useMemo } from "react";
import { RECIPE_TEMPLATES } from "@/lib/recipeTemplates";
import type { SavedRecipe } from "@/lib/recipesStore";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

function getTemplateName(templateId: string) {
  return RECIPE_TEMPLATES.find((t) => t.id === templateId)?.name ?? "Recipe";
}

function normalizeValue(v: string) {
  const s = String(v ?? "").trim();
  return s || "—";
}

export default function RecipePreviewOverlay({
  recipe,
  side,
  onClick,
}: {
  recipe: SavedRecipe;
  side: "left" | "right";
  onClick?: () => void;
}) {
  const templateName = useMemo(() => getTemplateName(recipe.templateId), [recipe.templateId]);

  const entries = useMemo(() => {
    const data = recipe.data || {};
    const t = RECIPE_TEMPLATES.find((x) => x.id === recipe.templateId);
    const fields = t?.fields ?? [];

    // Show a compact subset so it fits nicely on the book page
    // (Title + template line + up to ~4 fields)
    const ignore = new Set(["title"]);
    const pairs = fields
      .filter((f) => !ignore.has(f.key))
      .slice(0, 4)
      .map((f) => ({
        label: f.label,
        value: normalizeValue(data[f.key] ?? ""),
      }));

    return pairs;
  }, [recipe]);

  // Page layout: tighter top padding to bring title up
  return (
    <button
      onClick={onClick}
      className="group w-[420px] max-w-[42vw] select-none text-left"
      style={{
        fontFamily: handFont,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        className="rounded-[18px] px-6 pb-5 pt-4"
        style={{
          // No “card” background — looks like it’s printed on the book
          background: "transparent",
        }}
      >
        <div
          className="text-[40px] font-semibold leading-none text-black"
          style={{
            textShadow: "0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {recipe.title}
        </div>

        <div className="mt-1 text-sm font-semibold text-black/60">
          Template: {templateName}
        </div>

        <div className="mt-4 space-y-4">
          {entries.map((e) => (
            <div key={e.label}>
              <div className="text-sm font-semibold text-black/60">{e.label}</div>
              <div className="mt-1 text-base text-black/70">{e.value}</div>
              <div className="mt-2 h-[1px] w-full bg-black/12" />
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
