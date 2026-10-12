/**
 * Breakpoints at which the decorative SVG threads are actually visible.
 *
 * These MUST stay in sync with the Tailwind classes on the thread containers,
 * otherwise we either compute a thread nobody can see (wasted scroll work that
 * stalls flick-scrolling on iOS) or hide a thread we're still animating.
 *
 *   Chapter threads   `hidden md:block`  -> visible from 768px
 *   Hero ScrollThread `hidden lg:block`  -> visible from 1024px
 */

/** Chapter threads + section parallax: Tailwind `md` (768px). */
export const THREAD_MEDIA_QUERY = "(min-width: 768px)";

/** Hero ScrollThread: Tailwind `lg` (1024px). */
export const HERO_THREAD_MEDIA_QUERY = "(min-width: 1024px)";
