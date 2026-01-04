import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/menu-closed.png')" }}
    >
      {/* Pantry (bottom-right) */}
      <div className="absolute bottom-6 right-6 z-30">
        <Link
          href="/pantry"
          className="select-none text-4xl font-semibold text-white drop-shadow-md hover:opacity-90 focus:outline-none"
        >
          Pantry
        </Link>
      </div>

      {/* Open Book (gold text, lower on the book) */}
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2">
        <Link
          href="/book"
          className="select-none text-2xl font-semibold text-[#D6B46A] drop-shadow-md hover:opacity-90 focus:outline-none"
        >
          Open Book
        </Link>
      </div>
    </div>
  );
}
