"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook.
 *
 * Returns `false` on the server and during the first client render (so the
 * hydrated markup always matches), then the real value on the next tick.
 * Re-evaluates when the query starts or stops matching — e.g. on rotation.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
