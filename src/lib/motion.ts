// Web Animations helpers shared by the live demo board, widgets and Live Activity.

// With reduced motion the demos stay exactly as server-rendered.
export const motionOk = !matchMedia('(prefers-reduced-motion: reduce)').matches;

export const AMBER = '245 158 11';
export const BLUE = '59 130 246';

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

// Split-flap feel: changed text drops in from above. The element must not be
// display:inline, or the transform is ignored.
export function flip(el: HTMLElement, text: string, animated = true) {
  if (el.textContent === text) return;
  el.textContent = text;
  if (animated) {
    el.animate([{ transform: 'translateY(-60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], {
      duration: 380,
      easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
    });
  }
}

export function highlight(el: HTMLElement, rgb: string) {
  el.animate(
    [
      { backgroundColor: `rgb(${rgb} / 0)` },
      { backgroundColor: `rgb(${rgb} / 0.28)`, offset: 0.3 },
      { backgroundColor: `rgb(${rgb} / 0)` },
    ],
    { duration: 1600, easing: 'ease-out' },
  );
}

export function spin(el: Element | null | undefined) {
  el?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 800, easing: 'ease-in-out' });
}

interface Identified {
  id: number;
}

// Fixed-slot lists (the widgets): repaints each slot with its new item and
// slides items that moved up from their old slot; newcomers rise from below.
// The rows' parent must be positioned and clip overflow. Returns the new ids.
export function shiftSlots<T extends Identified>(
  rows: HTMLElement[],
  prev: readonly number[],
  next: readonly T[],
  paint: (row: HTMLElement, item: T, animated: boolean) => void,
): number[] {
  const tops = rows.map((row) => row.offsetTop);
  const bottom = rows[0].parentElement!.clientHeight;
  const from = rows.map((_, j) => prev.indexOf(next[j].id));
  rows.forEach((row, j) => paint(row, next[j], from[j] === j));
  rows.forEach((row, j) => {
    const k = from[j];
    if (k === j) return;
    const dy = (k === -1 ? bottom : tops[k]) - row.offsetTop;
    row.animate([{ transform: `translateY(${dy}px)`, opacity: k === -1 ? 0 : 1 }, { transform: 'none', opacity: 1 }], {
      duration: 600,
      easing: EASE,
    });
  });
  return next.slice(0, rows.length).map((item) => item.id);
}

// Rows leave and join a variable-length list (the hero board) by collapsing
// and growing in place, so the list keeps its height.
export function slide(row: HTMLElement, direction: 'in' | 'out') {
  const { paddingTop, paddingBottom } = getComputedStyle(row);
  const open = { height: `${row.offsetHeight}px`, paddingTop, paddingBottom, opacity: 1, transform: 'none' };
  const closed = {
    height: '0px',
    paddingTop: '0px',
    paddingBottom: '0px',
    opacity: 0,
    transform: direction === 'in' ? 'translateY(12px)' : 'translateX(-24px)',
  };
  row.style.overflow = 'hidden';
  const animation = row.animate(direction === 'in' ? [closed, open] : [open, closed], {
    duration: 700,
    easing: EASE,
    fill: 'forwards',
  });
  animation.finished.then(() => {
    if (direction === 'out') return row.remove();
    animation.cancel();
    row.style.removeProperty('overflow');
  });
}
