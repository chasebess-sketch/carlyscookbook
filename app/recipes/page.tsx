"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllRecipes, SavedRecipe } from "@/lib/recipesStore";
import { RECIPE_TEMPLATES } from "@/lib/recipeTemplates";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;
const GOLD = "#D8B25A";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function firstLetter(title: string) {
  const c = (title || "").trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

function getTemplateName(templateId: string) {
  return RECIPE_TEMPLATES.find((t) => t.id === templateId)?.name ?? templateId;
}

function getIngredientsText(r: SavedRecipe) {
  return (r.data?.ingredients ?? "").toString();
}

type Spread = {
  letter: string;
  left: SavedRecipe | null;
  right: SavedRecipe | null;
};

function parseCommaTerms(s: string) {
  return s
    .trim()
    .split(/[,;]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function joinTermsForCommaBar(terms: string[]) {
  return terms.map((t) => t.trim()).filter(Boolean).join(", ");
}

export default function ViewRecipesBook() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [fade, setFade] = useState(1);

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(["all"]);

  const [listOpen, setListOpen] = useState(false);

  // 🔍 page-view search panel
  const [searchOpen, setSearchOpen] = useState(false);
  const [dishQuery, setDishQuery] = useState("");

  // ingredient filtering source of truth (used by both views)
  const [ingredientTerms, setIngredientTerms] = useState<string[]>([""]);

  // page-view display string (comma bar), kept in sync with ingredientTerms
  const [ingredientQuery, setIngredientQuery] = useState("");

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  useEffect(() => {
    setIngredientQuery(joinTermsForCommaBar(ingredientTerms));
  }, [ingredientTerms]);

  const hasActiveSearch =
    dishQuery.trim().length > 0 || ingredientTerms.some((t) => t.trim().length > 0);

  const filteredByTemplate = useMemo(() => {
    if (selectedTemplates.includes("all")) return recipes;
    const set = new Set(selectedTemplates);
    return recipes.filter((r) => set.has(r.templateId));
  }, [recipes, selectedTemplates]);

  const normalizedTerms = useMemo(() => {
    return ingredientTerms.map((t) => t.trim().toLowerCase()).filter(Boolean);
  }, [ingredientTerms]);

  const filteredBySearch = useMemo(() => {
    const dish = dishQuery.trim().toLowerCase();

    return filteredByTemplate.filter((r) => {
      if (dish) {
        const title = (r.title || "").toLowerCase();
        if (!title.includes(dish)) return false;
      }

      if (normalizedTerms.length) {
        const ing = getIngredientsText(r).toLowerCase();
        if (!normalizedTerms.every((t) => ing.includes(t))) return false;
      }

      return true;
    });
  }, [filteredByTemplate, dishQuery, normalizedTerms]);

  const sorted = useMemo(() => {
    return [...filteredBySearch].sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredBySearch]);

  const spreads = useMemo<Spread[]>(() => {
    const groups = new Map<string, SavedRecipe[]>();

    for (const r of sorted) {
      const L = firstLetter(r.title);
      if (L === "#") continue;
      const arr = groups.get(L) ?? [];
      arr.push(r);
      groups.set(L, arr);
    }

    const out: Spread[] = [];
    for (const L of ALPHABET) {
      const arr = groups.get(L) ?? [];
      if (!arr.length) continue;

      for (let i = 0; i < arr.length; i += 2) {
        out.push({ letter: L, left: arr[i] ?? null, right: arr[i + 1] ?? null });
      }
    }

    return out.length ? out : [{ letter: "A", left: null, right: null }];
  }, [sorted]);

  useEffect(() => {
    setPageIndex((p) => Math.max(0, Math.min(p, spreads.length - 1)));
  }, [spreads.length]);

  const spread = spreads[Math.max(0, Math.min(pageIndex, spreads.length - 1))];
  const currentLetter = spread?.letter ?? "A";

  const letterToPage = useMemo(() => {
    const map = new Map<string, number>();
    spreads.forEach((sp, idx) => {
      if (!map.has(sp.letter)) map.set(sp.letter, idx);
    });
    return map;
  }, [spreads]);

  const goToPage = (next: number, dir: "left" | "right") => {
    const clamped = Math.max(0, Math.min(next, spreads.length - 1));
    if (clamped === pageIndex) return;

    setAnimDir(dir);
    setFade(0);
    window.setTimeout(() => {
      setPageIndex(clamped);
      setFade(1);
    }, 120);
  };

  const prev = () => goToPage(pageIndex - 1, "left");
  const next = () => goToPage(pageIndex + 1, "right");

  const openRecipe = (r: SavedRecipe) => router.push(`/recipes/${r.id}`);

  const toggleTemplateSafe = (id: string) => {
    setSelectedTemplates((prev) => {
      if (id === "all") return ["all"];
      const next = prev.includes("all") ? [] : [...prev];
      const has = next.includes(id);
      const updated = has ? next.filter((x) => x !== id) : [...next, id];
      return updated.length ? updated : ["all"];
    });

    setPageIndex(0);
  };

  const clearSearch = () => {
    setDishQuery("");
    setIngredientTerms([""]);
    setPageIndex(0);
  };

  // LIST VIEW + button helpers
  const setTerm = (idx: number, val: string) => {
    setIngredientTerms((prev) => prev.map((t, i) => (i === idx ? val : t)));
    setPageIndex(0);
  };

  const addTerm = () => setIngredientTerms((prev) => [...prev, ""]);

  const removeTerm = (idx: number) => {
    setIngredientTerms((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== idx);
    });
    setPageIndex(0);
  };

  // PAGE VIEW comma bar -> ingredientTerms
  const onChangeCommaBar = (val: string) => {
    setIngredientQuery(val);
    const terms = parseCommaTerms(val);
    setIngredientTerms(terms.length ? terms : [""]);
    setPageIndex(0);
  };

  const renderPreview = (r: SavedRecipe) => {
    const t = RECIPE_TEMPLATES.find((x) => x.id === r.templateId);
    const lines: Array<{ label: string; value: string }> = [];

    if (t) {
      const previewFields = t.fields.filter((f) => f.key !== "title").slice(0, 5);
      previewFields.forEach((f) => {
        const v = (r.data?.[f.key] ?? "").toString().trim();
        if (!v) return;
        const oneLine = v.replace(/\s+/g, " ").slice(0, 64);
        lines.push({ label: f.label, value: oneLine });
      });
    } else {
      const ing = getIngredientsText(r)
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)[0];
      if (ing) lines.push({ label: "Ingredients", value: ing.slice(0, 64) });
    }

    return (
      <button
        onClick={() => openRecipe(r)}
        className="h-full w-full select-none overflow-hidden text-left"
      >
        <div className="h-full w-full overflow-hidden pr-2 pt-2">
          <div
            className="text-3xl font-semibold text-black"
            style={{ fontFamily: handFont, lineHeight: "1.1" }}
          >
            {r.title}
          </div>

          <div className="mt-1 text-sm font-semibold text-black/70">
            Template: {getTemplateName(r.templateId)}
          </div>

          <div className="mt-3 space-y-3">
            {lines.length ? (
              lines.map((x, i) => (
                <div key={i}>
                  <div className="text-xs font-semibold text-black/70">{x.label}</div>
                  <div className="mt-1 h-[2px] w-full rounded bg-black/10" />
                  <div className="mt-1 text-sm text-black/75">{x.value}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-black/50">Click to open</div>
            )}
          </div>

          <div className="mt-3 h-[2px] w-full rounded bg-black/10 opacity-60" />
        </div>
      </button>
    );
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/book-open.png')" }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Back */}
      <div className="absolute left-6 top-6 z-30">
        <Link
          href="/book"
          className="select-none text-2xl font-semibold text-white drop-shadow hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont }}
        >
          Back
        </Link>
      </div>

      {/* 🔍 Search button */}
      <div className="absolute left-6 top-20 z-40">
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="h-12 w-12 select-none rounded-full bg-white/25 text-xl text-white shadow hover:bg-white/35"
          style={{ fontFamily: handFont }}
          aria-label="Search"
          title="Search"
        >
          🔍
        </button>
      </div>

      {/* List view button */}
      <div className="absolute right-6 top-6 z-30">
        <button
          onClick={() => setListOpen(true)}
          className="select-none rounded-full bg-white/20 px-5 py-2 text-lg font-semibold text-white shadow hover:bg-white/30"
          style={{ fontFamily: handFont }}
        >
          List View
        </button>
      </div>

      {/* Alphabet strip */}
      <div className="absolute left-1/2 top-8 z-20 w-[92%] max-w-5xl -translate-x-1/2">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          {ALPHABET.map((L) => {
            const has = letterToPage.has(L);
            const active = L === currentLetter;
            return (
              <button
                key={L}
                disabled={!has}
                onClick={() => {
                  const p = letterToPage.get(L);
                  if (p === undefined) return;
                  const dir = p > pageIndex ? "right" : "left";
                  goToPage(p, dir);
                }}
                className="select-none"
                style={{
                  fontFamily: handFont,
                  fontWeight: 700,
                  color: "white",
                  opacity: !has ? 0.25 : active ? 1 : 0.55,
                  fontSize: active ? 24 : 18,
                  textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                  cursor: has ? "pointer" : "default",
                }}
              >
                {L}
              </button>
            );
          })}
        </div>
      </div>

      {/* PAGE VIEW SEARCH PANEL (smaller) */}
      {searchOpen ? (
        <div className="absolute left-1/2 top-[78px] z-30 w-[92%] max-w-2xl -translate-x-1/2">
          <div className="p-2">
            <div className="flex items-center gap-3">
              <input
                value={dishQuery}
                onChange={(e) => {
                  setDishQuery(e.target.value);
                  setPageIndex(0);
                }}
                placeholder="Recipe Name Search"
                className="w-full rounded-full bg-transparent px-4 py-2 text-center text-base font-semibold text-white placeholder-white/70 outline-none ring-2 ring-white/70 focus:ring-white"
                style={{ fontFamily: handFont }}
              />

              <button
                onClick={clearSearch}
                className="rounded-full bg-transparent px-3 py-2 text-sm font-semibold text-white outline-none ring-2 ring-white/70 hover:ring-white"
                style={{ fontFamily: handFont }}
                title="Clear"
              >
                Clear
              </button>
            </div>

            <div className="mt-2">
              <input
                value={ingredientQuery}
                onChange={(e) => onChangeCommaBar(e.target.value)}
                placeholder="Ingredients Search (use commas)"
                className="w-full rounded-full bg-transparent px-4 py-2 text-center text-base font-semibold text-white placeholder-white/70 outline-none ring-2 ring-white/70 focus:ring-white"
                style={{ fontFamily: handFont }}
              />

              <div
                className="mt-1 text-center text-[11px] text-white/70"
                style={{ fontFamily: handFont }}
              >
                Tip: Separate with commas (eggs, cheese, garlic). All must match.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Book pages */}
      <div
        className="absolute left-1/2 top-[51%] h-[560px] w-[86%] max-w-5xl -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: fade,
          transition: "opacity 180ms ease-out, transform 180ms ease-out",
          transform:
            fade === 1
              ? "translate(-50%, -50%)"
              : animDir === "right"
              ? "translate(-52%, -50%)"
              : "translate(-48%, -50%)",
        }}
      >
        <div className="absolute left-[30%] top-[10%] h-[470px] w-[360px] -translate-x-1/2 overflow-hidden">
          {spread.left ? (
            renderPreview(spread.left)
          ) : (
            <div
              className="select-none pt-6 text-3xl font-semibold text-black/40"
              style={{ fontFamily: handFont }}
            >
              {sorted.length ? "" : "No recipes yet"}
            </div>
          )}
        </div>

        <div className="absolute left-[74%] top-[10%] h-[470px] w-[360px] -translate-x-1/2 overflow-hidden">
          {spread.right ? renderPreview(spread.right) : <div />}
        </div>
      </div>

      {/* Arrows */}
      <div className="absolute left-1/2 top-[84%] z-10 -translate-x-1/2">
        <div className="flex items-center gap-10">
          <button
            onClick={prev}
            disabled={pageIndex <= 0}
            className="select-none text-5xl font-bold drop-shadow"
            style={{
              color: GOLD,
              opacity: pageIndex <= 0 ? 0.25 : 1,
              fontFamily: handFont,
            }}
          >
            ←
          </button>

          <button
            onClick={next}
            disabled={pageIndex >= spreads.length - 1}
            className="select-none text-5xl font-bold drop-shadow"
            style={{
              color: GOLD,
              opacity: pageIndex >= spreads.length - 1 ? 0.25 : 1,
              fontFamily: handFont,
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Template filters */}
      <div className="absolute left-1/2 top-[78%] z-10 -translate-x-1/2">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button
            onClick={() => toggleTemplateSafe("all")}
            className="select-none"
            style={{
              fontFamily: handFont,
              fontWeight: 700,
              color: "white",
              opacity: selectedTemplates.includes("all") ? 1 : 0.35,
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              fontSize: 20,
            }}
          >
            All
          </button>

          {RECIPE_TEMPLATES.map((t) => {
            const active = selectedTemplates.includes("all")
              ? false
              : selectedTemplates.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTemplateSafe(t.id)}
                className="select-none"
                style={{
                  fontFamily: handFont,
                  fontWeight: 700,
                  color: "white",
                  opacity: active ? 1 : 0.35,
                  textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                  fontSize: 20,
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST VIEW OVERLAY (TITLE PINNED + EVERYTHING ELSE SCROLLS) */}
      {listOpen ? (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setListOpen(false)}
          />

          <div className="absolute left-1/2 top-1/2 w-[92%] max-w-5xl -translate-x-1/2 -translate-y-1/2">
            {/* IMPORTANT: real height + overflow hidden */}
            <div className="h-[85vh] overflow-hidden rounded-[26px] bg-white shadow-2xl">
              <div className="flex h-full flex-col">
                {/* Header pinned */}
                <div className="shrink-0 border-b border-black/10 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="text-4xl font-semibold text-black"
                        style={{ fontFamily: handFont }}
                      >
                        Recipes List
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        Search here (with + for ingredients) — it stays synced with
                        page view.
                      </div>
                    </div>

                    <button
                      onClick={() => setListOpen(false)}
                      className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/10"
                      style={{ fontFamily: handFont }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Body scrolls (THIS is what fixes the “can’t scroll” problem) */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                  {/* List search controls */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={dishQuery}
                        onChange={(e) => {
                          setDishQuery(e.target.value);
                          setPageIndex(0);
                        }}
                        className="min-w-[260px] flex-1 rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                        placeholder="Recipe Name Search"
                        style={{ fontFamily: handFont }}
                      />

                      <button
                        onClick={clearSearch}
                        className="rounded-xl bg-black/5 px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/10"
                        style={{ fontFamily: handFont }}
                        title="Clear"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Ingredients (multi input + button) */}
                    <div className="space-y-2">
                      {ingredientTerms.map((term, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={term}
                            onChange={(e) => setTerm(idx, e.target.value)}
                            className="flex-1 rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                            placeholder={
                              idx === 0 ? "Ingredients Search" : "Add another ingredient…"
                            }
                            style={{ fontFamily: handFont }}
                          />

                          {idx === 0 ? (
                            <button
                              onClick={addTerm}
                              className="h-[46px] w-[46px] rounded-xl bg-black/5 text-2xl font-bold text-black/70 hover:bg-black/10"
                              style={{ fontFamily: handFont }}
                              title="Add ingredient"
                              aria-label="Add ingredient"
                            >
                              +
                            </button>
                          ) : (
                            <button
                              onClick={() => removeTerm(idx)}
                              className="h-[46px] w-[46px] rounded-xl bg-black/5 text-xl font-bold text-black/70 hover:bg-black/10"
                              style={{ fontFamily: handFont }}
                              title="Remove"
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-black/50">
                      {hasActiveSearch ? "Showing filtered results." : "No search filters applied."}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
                    {sorted.length === 0 ? (
                      <div className="p-6 text-black/60">No matches.</div>
                    ) : (
                      <div className="divide-y divide-black/10">
                        {sorted.map((r) => {
                          const firstIng = getIngredientsText(r)
                            .split("\n")
                            .map((x) => x.trim())
                            .filter(Boolean)
                            .slice(0, 3);

                          return (
                            <button
                              key={r.id}
                              onClick={() => openRecipe(r)}
                              className="w-full p-4 text-left hover:bg-black/5"
                            >
                              <div
                                className="text-xl font-semibold text-black"
                                style={{ fontFamily: handFont }}
                              >
                                {r.title}
                              </div>
                              <div className="text-sm font-semibold text-black/60">
                                {getTemplateName(r.templateId)}
                              </div>

                              {firstIng.length ? (
                                <div className="mt-2 text-sm text-black/70">
                                  <span className="font-semibold">Ingredients:</span>{" "}
                                  {firstIng.join(", ")}
                                  {getIngredientsText(r).split("\n").filter(Boolean).length > 3
                                    ? "…"
                                    : ""}
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* padding so last content never feels clipped */}
                  <div className="h-8" />

                  <div className="pb-2 text-xs text-black/50">
                    Tip: Ingredient search narrows results by requiring ALL entered terms to match.
                  </div>
                </div>
              </div>
            </div>
            {/* end card */}
          </div>
        </div>
      ) : null}
    </div>
  );
}
