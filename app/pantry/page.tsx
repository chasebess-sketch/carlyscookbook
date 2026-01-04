"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPantryItem,
  deleteManyPantryItems,
  getPantry,
  togglePantryItem,
  updatePantryItemImage,
} from "@/lib/pantryStore";

type PantryItem = {
  id: string;
  name: string;
  qty?: string;
  inStock: boolean; // true = What we have, false = What we need
  image?: string; // dataURL
  createdAt?: number;
};

const handFont =
  `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

const ADD_BUTTONS = [
  { left: "25%", top: "20%" },
  { left: "60%", top: "54%" },
  { left: "14%", top: "43%" },
  { left: "48%", top: "31%" },
  { left: "82%", top: "43%" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function PantryPage() {
  const router = useRouter();

  const [items, setItems] = useState<PantryItem[]>([]);

  // modal state
  const [listOpen, setListOpen] = useState(false);

  // add modal (always above list modal)
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  // edit/delete mode
  const [editMode, setEditMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());

  // file inputs per item (hidden)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setItems(getPantry());
  }, []);

  const whatWeHave = useMemo(() => items.filter((i) => i.inStock), [items]);
  const whatWeNeed = useMemo(() => items.filter((i) => !i.inStock), [items]);

  const openAdd = () => {
    setAddOpen(true);
    setName("");
    setQty("");
  };

  const closeAdd = () => {
    setAddOpen(false);
    setName("");
    setQty("");
  };

  const submitAdd = () => {
    const n = name.trim();
    if (!n) {
      alert("Add an item name 🙂");
      return;
    }
    const updated = addPantryItem({ name: n, qty: qty.trim() || undefined });
    setItems(updated);
    closeAdd();
  };

  const toggleItem = (id: string) => {
    const updated = togglePantryItem(id);
    setItems(updated);
  };

  const toggleSelectDelete = (id: string) => {
    setSelectedToDelete((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const doDeleteSelected = () => {
    if (selectedToDelete.size === 0) return;
    const updated = deleteManyPantryItems(Array.from(selectedToDelete));
    setItems(updated);
    setSelectedToDelete(new Set());
  };

  const clickImage = (id: string) => {
    const el = fileInputRefs.current[id];
    if (el) el.click();
  };

  const onPickImage = async (id: string, file?: File) => {
    if (!file) return;

    // small safety: avoid huge images
    if (file.size > 2_500_000) {
      alert("That image is a bit large. Try a smaller one (under ~2.5MB).");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    const updated = updatePantryItemImage(id, dataUrl);
    setItems(updated);
  };

  // dynamic back behavior
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/pantry.png')" }}
    >
      {/* Back (dynamic) */}
      <div className="absolute left-6 top-6 z-20">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-white"
          style={{ fontFamily: handFont }}
        >
          Back
        </button>
      </div>

      {/* Shelf “Add item” hotspots */}
      {ADD_BUTTONS.map((pos, idx) => (
        <button
          key={idx}
          onClick={openAdd}
          className="absolute rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-black shadow hover:bg-white"
          style={{
            left: pos.left,
            top: pos.top,
            fontFamily: handFont,
          }}
        >
          + Add item
        </button>
      ))}

      {/* View List */}
      <div className="absolute left-1/2 top-[71%] z-10 -translate-x-1/2">
        <button
          onClick={() => {
            setListOpen(true);
            setEditMode(false);
            setSelectedToDelete(new Set());
          }}
          className="text-4xl font-semibold text-black hover:underline"
          style={{ fontFamily: handFont }}
        >
          View List
        </button>
      </div>

      {/* LIST MODAL */}
      {listOpen ? (
        <div className="absolute inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setListOpen(false);
              setEditMode(false);
              setSelectedToDelete(new Set());
            }}
          />

          <div className="absolute left-1/2 top-1/2 w-[92%] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
            {/* Title row */}
            <div className="flex items-center justify-between gap-3">
              <div
                className="text-4xl font-semibold text-black"
                style={{ fontFamily: handFont }}
              >
                Pantry List
              </div>

              <button
                onClick={() => {
                  setListOpen(false);
                  setEditMode(false);
                  setSelectedToDelete(new Set());
                }}
                className="rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-black hover:bg-black/15"
                style={{ fontFamily: handFont }}
              >
                Close
              </button>
            </div>

            {/* Two columns */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* LEFT */}
              <div>
                <div className="mb-3 text-sm font-semibold text-black/70">
                  Show Pantry List
                </div>

                <div className="space-y-2">
                  {whatWeHave.length === 0 ? (
                    <div className="text-black/40">Nothing here yet.</div>
                  ) : (
                    whatWeHave.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                      >
                        {/* image upload square */}
                        <div className="flex items-center gap-3">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[it.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onPickImage(it.id, e.target.files?.[0])}
                          />

                          <button
                            onClick={() => clickImage(it.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm hover:bg-black/5"
                            aria-label={`Upload image for ${it.name}`}
                          >
                            {it.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.image}
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-lg text-black/40">+</span>
                            )}
                          </button>

                          <div>
                            <div
                              className="text-lg font-semibold text-black"
                              style={{ fontFamily: handFont }}
                            >
                              {it.name}
                            </div>
                            {it.qty ? (
                              <div className="text-sm text-black/60">Qty: {it.qty}</div>
                            ) : null}
                          </div>
                        </div>

                        {/* bubble */}
                        <button
                          onClick={() =>
                            editMode ? toggleSelectDelete(it.id) : toggleItem(it.id)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white hover:bg-black/5"
                          aria-label={editMode ? "Select to delete" : "Move item"}
                        >
                          {editMode ? (
                            <span className="text-lg">
                              {selectedToDelete.has(it.id) ? "●" : "○"}
                            </span>
                          ) : (
                            <span className="text-lg">●</span>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div className="mb-3 text-sm font-semibold text-black/70">
                  Shop Grocery List
                </div>

                <div className="space-y-2">
                  {whatWeNeed.length === 0 ? (
                    <div className="text-black/40">Nothing here yet.</div>
                  ) : (
                    whatWeNeed.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                      >
                        {/* image upload square */}
                        <div className="flex items-center gap-3">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[it.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onPickImage(it.id, e.target.files?.[0])}
                          />

                          <button
                            onClick={() => clickImage(it.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm hover:bg-black/5"
                            aria-label={`Upload image for ${it.name}`}
                          >
                            {it.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.image}
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-lg text-black/40">+</span>
                            )}
                          </button>

                          <div>
                            <div
                              className="text-lg font-semibold text-black"
                              style={{ fontFamily: handFont }}
                            >
                              {it.name}
                            </div>
                            {it.qty ? (
                              <div className="text-sm text-black/60">Qty: {it.qty}</div>
                            ) : null}
                          </div>
                        </div>

                        {/* bubble */}
                        <button
                          onClick={() =>
                            editMode ? toggleSelectDelete(it.id) : toggleItem(it.id)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white hover:bg-black/5"
                          aria-label={editMode ? "Select to delete" : "Move item"}
                        >
                          {editMode ? (
                            <span className="text-lg">
                              {selectedToDelete.has(it.id) ? "●" : "○"}
                            </span>
                          ) : (
                            <span className="text-lg">○</span>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom-left controls */}
            <div className="mt-6 flex items-center gap-2">
              {!editMode ? (
                <>
                  <button
                    onClick={openAdd}
                    className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    style={{ fontFamily: handFont }}
                  >
                    + Add item
                  </button>

                  <button
                    onClick={() => {
                      setEditMode(true);
                      setSelectedToDelete(new Set());
                    }}
                    className="rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-black hover:bg-black/15"
                    style={{ fontFamily: handFont }}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={doDeleteSelected}
                    disabled={selectedToDelete.size === 0}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                    style={{ fontFamily: handFont }}
                  >
                    Delete Selected
                  </button>

                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSelectedToDelete(new Set());
                    }}
                    className="rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-black hover:bg-black/15"
                    style={{ fontFamily: handFont }}
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ADD MODAL */}
      {addOpen ? (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/35" onClick={closeAdd} />

          <div className="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
            <div
              className="text-2xl font-semibold text-black"
              style={{ fontFamily: handFont }}
            >
              Add Pantry Item
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-black/70">
                  Item
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                  placeholder="e.g., Eggs"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black/70">
                  Qty (optional)
                </label>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-black/30"
                  placeholder="e.g., 12"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={submitAdd}
                  className="flex-1 rounded-2xl bg-black px-5 py-3 text-base font-semibold text-white hover:opacity-90"
                  style={{ fontFamily: handFont }}
                >
                  Add
                </button>

                <button
                  onClick={closeAdd}
                  className="flex-1 rounded-2xl bg-black/10 px-5 py-3 text-base font-semibold text-black hover:bg-black/15"
                  style={{ fontFamily: handFont }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
