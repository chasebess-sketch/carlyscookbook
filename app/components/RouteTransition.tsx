"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteTransition() {
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Trigger transition after route changes (covers back/forward too)
    setPlaying(true);
    const t = window.setTimeout(() => setPlaying(false), 520);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={`rt ${playing ? "rt-play" : ""}`}
      aria-hidden="true"
    />
  );
}
