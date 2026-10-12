/**
 * Calls `handler` only when the viewport *width* actually changes, debounced.
 *
 * Why width-only: iOS Safari fires `resize` every time the URL bar collapses or
 * expands, which happens during a fast flick-scroll. Anything expensive wired
 * to plain `resize` therefore runs mid-fling and stalls the scroll. Chrome on
 * Android keeps its layout viewport fixed when its toolbar hides and never
 * fires that event — which is why scroll bugs of this shape are iOS-only.
 *
 * Width changes still come through, so real rotations and desktop window
 * resizes are handled normally.
 *
 * @returns cleanup function that removes the listener and cancels any pending call.
 */
export function onWidthResize(handler: () => void, delayMs = 200): () => void {
  let lastWidth = window.innerWidth;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const listener = () => {
    // Height-only change => browser chrome showing/hiding. Ignore it.
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    if (timer) clearTimeout(timer);
    timer = setTimeout(handler, delayMs);
  };

  window.addEventListener("resize", listener);

  return () => {
    window.removeEventListener("resize", listener);
    if (timer) clearTimeout(timer);
  };
}
