"use client";

import Link from "next/link";

const handFont = `"Comic Sans MS", "Bradley Hand", "Segoe Print", "Chalkboard SE", cursive`;

const scribbleSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="900">
  <style>
    text{
      font-family: "Bradley Hand","Segoe Print","Chalkboard SE","Comic Sans MS",cursive;
      font-size: 18px;
      fill: rgba(0,0,0,0.30);
    }
  </style>
  <text x="50" y="70">• preheat oven • stir • simmer • fold • season • taste • whisk •</text>
  <text x="60" y="120">notes: add salt slowly — garlic first — taste again —</text>
  <text x="40" y="170">shopping: eggs, cheese, lettuce, pasta, flour, butter</text>
  <text x="70" y="220">cook time: 25 min • servings: 4 •</text>
  <text x="40" y="270">mix until smooth, then rest 10 minutes</text>
  <text x="60" y="320">tip: clean as you go :)</text>

  <text x="40" y="420">• preheat oven • stir • simmer • fold • season • taste • whisk •</text>
  <text x="60" y="470">notes: add salt slowly — garlic first — taste again —</text>
  <text x="40" y="520">shopping: eggs, cheese, lettuce, pasta, flour, butter</text>
  <text x="70" y="570">cook time: 25 min • servings: 4 •</text>
  <text x="40" y="620">mix until smooth, then rest 10 minutes</text>
  <text x="60" y="670">tip: clean as you go :)</text>
</svg>
`);

const pageOverlayStyle: React.CSSProperties = {
  backgroundImage: [
    "repeating-linear-gradient(to bottom, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 1px, transparent 1px, transparent 30px)",
    `url("data:image/svg+xml,${scribbleSvg}")`,
  ].join(", "),
  backgroundSize: "100% 100%, 520px 520px",
  backgroundPosition: "center, center",
  backgroundRepeat: "repeat, repeat",
  mixBlendMode: "multiply",
};

export default function BookHome() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/book-open.png')" }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Back */}
      <div className="absolute left-6 top-6 z-30">
        <Link
          href="/"
          className="select-none text-2xl font-semibold text-white drop-shadow hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont }}
        >
          Back
        </Link>
      </div>

      {/* Pantry */}
      <div className="absolute bottom-6 right-6 z-30">
        <Link
          href="/pantry"
          className="select-none text-3xl font-semibold text-white drop-shadow-md hover:opacity-90 focus:outline-none"
          style={{ fontFamily: handFont }}
        >
          Pantry
        </Link>
      </div>

      {/* CONTENT */}
      <div className="absolute left-1/2 top-1/2 w-[86%] max-w-5xl -translate-x-1/2 -translate-y-1/2">
        {/* LEFT PAGE */}
        <div className="absolute left-[36%] top-[47%] h-[520px] w-[380px] -translate-x-1/2 -translate-y-1/2">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[10px] opacity-[0.35]"
            style={pageOverlayStyle}
          />

          <Link
            href="/recipes/new"
            className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 select-none text-2xl font-semibold text-black hover:opacity-90 focus:outline-none"
            style={{ fontFamily: handFont }}
          >
            Create New Recipe
          </Link>
        </div>

        {/* RIGHT PAGE */}
        <div className="absolute left-[68%] top-[47%] h-[520px] w-[380px] -translate-x-1/2 -translate-y-1/2">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[10px] opacity-[0.35]"
            style={pageOverlayStyle}
          />

          <Link
            href="/recipes"
            className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 select-none text-2xl font-semibold text-black hover:opacity-90 focus:outline-none"
            style={{ fontFamily: handFont }}
          >
            View Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
