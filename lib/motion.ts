export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export const scrollRevealTransition = {
  duration: 0.55,
  ease: EASE_OUT_EXPO,
} as const;

export function staggerDelay(index: number, stepSec = 0.08): number {
  return index * stepSec;
}

/**
 * `useReducedMotion()` is `null` on the server — treating only explicit `true` as reduced
 * avoids SSR using “no enter” while the client animates, which causes hydration mismatch.
 */
export function allowEnterMotion(prefersReduced: boolean | null): boolean {
  return prefersReduced !== true;
}
