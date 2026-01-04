"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RECIPE_TEMPLATES } from "@/lib/recipeTemplates";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

function preload(src: string) {
  if (typeof window === "undefined") return;
  const img = new Image();
  img.src = src;
}

export default function CreateRecipeTemplatePicker() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(RECIPE_TEMPLATES[0].id);

  const selected = useMemo(
    () => RECIPE_TEMPLATES.find((t) => t.id === selectedId) ?? RECIPE_TEMPLATES[0],
    [selectedId]
  );

  const previewSections = useMemo(() => {
    const ignoreKeys = new Set(["title"]);
    return selected.fields
      .filter((f) => !ignoreKeys.has(f.key))
      .map((f) => ({
        heading: f.label,
        lines: f.type === "textarea" ? (f.rows ?? 6) : 1,
      }));
  }, [selected]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/menu-closed.png')" }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Back (fixed so it never gets crushed) */}
      <div className="fixed left-4 top-4 z-50 md:left-6 md:top-6">
        <Link
          href="/book"
          prefetch
          onMouseEnter={() => preload("/book-open.png")}
          className="inline-block select-none text-2xl font-semibold text-white drop-shadow hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont }}
        >
          Back
        </Link>
      </div>

      {/* Pantry shortcut (smaller on mobile) */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <Link
          href="/pantry"
          prefetch
          onMouseEnter={() => preload("/pantry.png")}
          className="inline-block select-none font-semibold text-white drop-shadow-md hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont, fontSize: "28px" }}
        >
          <span className="text-2xl md:text-3xl">Pantry</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6 pt-24 md:flex-row md:pt-12">
        {/* LEFT: template list */}
        <div className="w-full md:max-w-sm">
          <h1
            className="mb-4 text-4xl font-semibold text-white drop-shadow"
            style={{ fontFamily: handFont }}
          >
            Choose a template
          </h1>

          <div className="space-y-3">
            {RECIPE_TEMPLATES.map((t) => {
              const active = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={[
                    "w-full rounded-2xl border p-4 text-left shadow-sm",
                    "focus:outline-none",
                    active
                      ? "border-white/90 bg-white/90"
                      : "border-white/60 bg-white/80 hover:bg-white/90",
                  ].join(" ")}
                >
                  <div
                    className="text-2xl font-semibold text-black"
                    style={{ fontFamily: handFont }}
                  >
                    {t.name}
                  </div>
                  <div className="mt-1 text-sm text-black/80">{t.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              className="w-full rounded-2xl bg-white/90 px-5 py-3 text-lg font-semibold shadow hover:bg-white"
              style={{ fontFamily: handFont }}
              onClick={() => router.push(`/recipes/new/editor?template=${selectedId}`)}
              onMouseEnter={() => preload("/menu-closed.png")}
            >
              Use this template
            </button>
          </div>

          {/* Add a little spacer so the fixed Pantry button never covers content */}
          <div className="h-16 md:hidden" />
        </div>

        {/* RIGHT: preview */}
        <div className="w-full flex-1 md:flex md:items-start md:justify-end">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-4">
              <div
                className="text-3xl font-semibold text-black"
                style={{ fontFamily: handFont }}
              >
                {selected.name}
              </div>
              <div className="text-sm text-black/60">
                Preview (this is what your recipe page will look like)
              </div>
            </div>

            <div className="space-y-5">
              {previewSections.map((s) => (
                <div key={s.heading}>
                  <div className="mb-2 text-sm font-semibold text-black/80">
                    {s.heading}
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: s.lines }).map((_, idx) => (
                      <div key={idx} className="h-[10px] w-full rounded bg-black/10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom spacer on mobile */}
          <div className="h-20 md:hidden" />
        </div>
      </div>
    </div>
  );
}
