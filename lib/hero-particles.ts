import { HERO_STAR_POINT_SIZE_SCALE } from "@/lib/hero-particles-appearance";

/** Hero glow: linear-gradient on large / small orbs (design reference). */
export const GRADIENT_BIG =
  "linear-gradient(229deg, rgb(191, 88, 255) 13%, rgba(191, 88, 255, 0) 35.0236%, rgba(255, 127, 30, 0) 64.1724%, rgb(255, 127, 30) 88%)";

export const GRADIENT_SMALL =
  "linear-gradient(141deg, rgb(191, 88, 255) 13%, rgba(191, 88, 255, 0) 35.0236%, rgba(255, 127, 30, 0) 64.1724%, rgb(255, 127, 30) 88%)";

const PARTICLE_POOL = 220;

const TTL_MAX_SEC = 10;
const TTL_FIRST_MIN_MS = 0;
const CYCLE0_DELAY_MAX_MS = 2000;

const OPACITY_SAMPLE_N = 28;

const OPACITY_FADE_IN_SEC = 2;
/** Fade-out duration (wall seconds); capped by segment length. */
const OPACITY_FADE_OUT_SEC = 5;

/** Stronger → respawns favor the outer rim more (cycle 0 ignores this). */
const RESPAWN_RIM_BIAS_BETA = 2.5;

const DRIFT_V_BASE_PX_PER_SEC = 70;
const DRIFT_R_FACTOR_MIN = 0.15;
const DRIFT_R_FACTOR_MAX = 1.25;
const MOTION_RADIAL_SAMPLES = 28;

export const TTL_MAX_MS = TTL_MAX_SEC * 1000;
const TTL_FIRST_SPAN_MS = TTL_MAX_MS - TTL_FIRST_MIN_MS;

export const SEGMENT_FALLBACK_GRACE_MS = 1600;

/**
 * `?debugStars=1` / `localStorage.debugStars=1` → TTL summary only (quiet).
 * `?debugStars=verbose` / `localStorage.debugStars=verbose` → also per-particle arm/end (noisy; Strict Mode doubles mounts).
 */
export function readHeroParticleDebugMode(): {
  enabled: boolean;
  verbose: boolean;
} {
  if (typeof window === "undefined") return { enabled: false, verbose: false };
  try {
    const q = new URLSearchParams(window.location.search).get("debugStars");
    if (q === "verbose") return { enabled: true, verbose: true };
    if (q === "1") return { enabled: true, verbose: false };
    const ls = window.localStorage.getItem("debugStars");
    if (ls === "verbose") return { enabled: true, verbose: true };
    if (ls === "1") return { enabled: true, verbose: false };
  } catch {
    /* ignore */
  }
  return { enabled: false, verbose: false };
}

function mix32(n: number): number {
  let x = n >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

function hashU01(i: number, salt: number): number {
  return mix32(Math.imul(i + 1, 0x9e3779b1) ^ salt) / 0x1_0000_0000;
}

export type Star = {
  ux: number;
  uy: number;
  endNorm: number;
  size: number;
  opacityStart: number;
  firstTtlMs: number;
  phaseScatterMs: number;
  cycle0DelayMs: number;
};

function phaseScatterMsForIndex(i: number): number {
  return (mix32(Math.imul(i + 1, 0x85ebca6b) ^ 0x51ed_4a11) >>> 0) % 800;
}

export const STARS: Star[] = Array.from({ length: PARTICLE_POOL }, (_, i) => {
  const ux = hashU01(i, 0x243f_6a88);
  const uy = hashU01(i, 0x85a3_08d3);
  const endNorm = Math.floor(hashU01(i, 0x1319_8a2e) * 100) / 100;
  const size =
    Math.max(1.55, 0.95 + (i % 7) * 0.34) *
    HERO_STAR_POINT_SIZE_SCALE;
  const opacityStart = 0.48 + Math.floor(hashU01(i, 0xe6c0_9347) * 32) / 100;
  const uTtl = hashU01(i, 0x5bd1_e995);
  const firstTtlMs = Math.floor(uTtl * TTL_MAX_MS);
  const cycle0DelayMs = Math.floor(
    hashU01(i, 0x4b7f_1a2c) * CYCLE0_DELAY_MAX_MS,
  );
  return {
    ux,
    uy,
    endNorm,
    size,
    opacityStart,
    firstTtlMs,
    phaseScatterMs: phaseScatterMsForIndex(i),
    cycle0DelayMs,
  };
});

export function debugLogParticleTimings(): void {
  const fire0 = STARS.map(
    (s) => s.cycle0DelayMs + s.firstTtlMs + s.phaseScatterMs,
  );
  const sorted = [...fire0].sort((a, b) => a - b);
  const ttl0 = STARS.map((s) => s.firstTtlMs);
  const bin = (ms: number, edges: number[]) => {
    let k = edges.length;
    for (let j = 0; j < edges.length; j++) {
      if (ms < edges[j]) {
        k = j;
        break;
      }
    }
    return k;
  };
  const edges = [2000, 4000, 6000, 8000, 10_000];
  const ttlBins = Array(edges.length + 1).fill(0);
  for (const t of ttl0) {
    ttlBins[bin(t, edges)]++;
  }
  const med = sorted[Math.floor(sorted.length / 2)];
  console.groupCollapsed("[hero-background] TTL / timing (cycle 0)");
  console.log("constants", {
    TTL_MAX_MS,
    TTL_FIRST_MIN_MS,
    TTL_FIRST_SPAN_MS,
    CYCLE0_DELAY_MAX_MS,
    SEGMENT_FALLBACK_GRACE_MS,
  });
  console.log(
    "firstTtlMs histogram buckets ms [<2k <4k <6k <8k <10k ≥10k]:",
    ttlBins.join(","),
  );
  console.log("wall time to first cycle++ (delay0+ttl0+scatter) ms", {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: med,
  });
  for (const thr of [500, 1000, 2000, 5000, 10_000, 32_000]) {
    console.log(
      `  fire0 ≤ ${thr}ms:`,
      fire0.filter((t) => t <= thr).length,
      "/",
      PARTICLE_POOL,
    );
  }
  console.table(
    STARS.slice(0, 28).map((s, i) => ({
      i,
      delay0: s.cycle0DelayMs,
      ttl0: s.firstTtlMs,
      scat: s.phaseScatterMs,
      fire0: s.cycle0DelayMs + s.firstTtlMs + s.phaseScatterMs,
    })),
  );
  console.groupEnd();
}

function maxRadialExtentPx(
  theta: number,
  halfW: number,
  halfH: number,
): number {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  if (c < 1e-8) return halfH;
  if (s < 1e-8) return halfW;
  return Math.min(halfW / c, halfH / s);
}

function spawnOffsetPx(
  ux: number,
  uy: number,
  w: number,
  h: number,
  outwardRespawnBias: boolean,
): { x: number; y: number; angle: number; rSpawn: number } {
  const pad = 8;
  const halfW = Math.max(0, w / 2 - pad);
  const halfH = Math.max(0, h / 2 - pad);
  let x = (ux - 0.5) * 2 * halfW;
  let y = (uy - 0.5) * 2 * halfH;
  const minSide = Math.min(w, h);
  const rHole = minSide * 0.186;
  let r = Math.hypot(x, y);
  if (r < rHole) {
    if (r < 1e-4) {
      const bump =
        (((ux * 7919 + uy * 21341) % 1000) / 1000) * Math.PI * 2;
      x = Math.cos(bump) * rHole * 1.02;
      y = Math.sin(bump) * rHole * 1.02;
    } else {
      const s = (rHole * 1.02) / r;
      x *= s;
      y *= s;
    }
    r = Math.hypot(x, y);
  }
  if (outwardRespawnBias) {
    const theta = Math.atan2(y, x);
    const rMax = maxRadialExtentPx(theta, halfW, halfH);
    if (rMax > rHole + 2) {
      const span = rMax - rHole;
      const u = Math.min(1, Math.max(0, (r - rHole) / span));
      const beta = RESPAWN_RIM_BIAS_BETA;
      const uBiased = 1 - (1 - u) ** beta;
      const rNew = rHole + uBiased * span;
      x = Math.cos(theta) * rNew;
      y = Math.sin(theta) * rNew;
      r = Math.hypot(x, y);
    }
  }
  const angle = Math.atan2(y, x);
  return { x, y, angle, rSpawn: r };
}

function fadeInEndFrac(segmentDurationSec: number): number {
  const d = Math.max(segmentDurationSec, 1e-3);
  const fadeInWall = Math.min(OPACITY_FADE_IN_SEC, d * 0.33);
  return fadeInWall / d;
}

/**
 * Fade in, then hold peak until a 5s (capped) fade-out window that starts at the earlier of
 * ring arrival and `(segment − fade-out)`, so ring hits and TTL end both use the same fade length.
 */
function opacitySamplesWithFadeOut(
  peak: number,
  durationSec: number,
  arrivalFrac: number,
) {
  const D = Math.max(durationSec, 1e-3);
  const fadeInEnd = fadeInEndFrac(D);
  const fadeOutSec = Math.min(OPACITY_FADE_OUT_SEC, D);
  const T_arrive = Math.min(1, Math.max(0, arrivalFrac)) * D;
  const fadeStartSec = Math.max(
    fadeInEnd * D,
    Math.min(T_arrive, Math.max(0, D - fadeOutSec)),
  );
  const fadeEndSec = Math.min(D, fadeStartSec + fadeOutSec);
  const fadeStartNorm = fadeStartSec / D;
  const fadeEndNorm = fadeEndSec / D;

  const n = OPACITY_SAMPLE_N;
  const times = Array.from({ length: n }, (_, i) => i / (n - 1));
  const values = times.map((t) => {
    if (t <= fadeInEnd) {
      const u = fadeInEnd > 1e-6 ? t / fadeInEnd : 1;
      return peak * u * u * (3 - 2 * u);
    }
    if (t < fadeStartNorm) return peak;
    if (t >= fadeEndNorm) return 0;
    const span = fadeEndNorm - fadeStartNorm;
    const u = span > 1e-9 ? (t - fadeStartNorm) / span : 1;
    return peak * (1 - u);
  });
  const ease = Array.from({ length: n - 1 }, () => "linear" as const);
  return { times, values, ease };
}

function driftSpeedPxPerSec(r: number, rRef: number, vStar: number): number {
  const f = Math.min(
    DRIFT_R_FACTOR_MAX,
    Math.max(DRIFT_R_FACTOR_MIN, r / rRef),
  );
  return DRIFT_V_BASE_PX_PER_SEC * f * vStar;
}

function buildRadialDriftKeyframes(
  c: number,
  sn: number,
  rSpawn: number,
  endR: number,
  rRef: number,
  segmentCapDurationSec: number,
  particleIndex: number,
): {
  effectiveSegmentSec: number;
  arrivalFrac: number;
  motionX: number[];
  motionY: number[];
  motionTimes: number[];
  motionEase: readonly "linear"[];
} {
  const vStar = 0.85 + hashU01(particleIndex, 0x6a09_e667) * 0.3;
  const travel = rSpawn - endR;
  const segmentSec = Math.max(1e-3, segmentCapDurationSec);

  if (travel < 1e-6) {
    const x = c * rSpawn;
    const y = sn * rSpawn;
    return {
      effectiveSegmentSec: segmentSec,
      arrivalFrac: 0,
      motionX: [x, x],
      motionY: [y, y],
      motionTimes: [0, 1],
      motionEase: ["linear"],
    };
  }

  const N = MOTION_RADIAL_SAMPLES;
  const dt: number[] = [];
  for (let j = 0; j < N; j++) {
    const rj = rSpawn + (endR - rSpawn) * (j / N);
    const rj1 = rSpawn + (endR - rSpawn) * ((j + 1) / N);
    const deltaR = rj - rj1;
    const rBar = (rj + rj1) * 0.5;
    const v = driftSpeedPxPerSec(rBar, rRef, vStar);
    dt.push(v > 1e-9 ? deltaR / v : 0);
  }
  let T_raw = dt.reduce((a, b) => a + b, 0);
  if (T_raw < 1e-9) T_raw = 1e-9;

  const pathFrac = Math.min(1, segmentSec / T_raw);
  const rEnd = rSpawn + (endR - rSpawn) * pathFrac;
  const T_arrive = pathFrac * T_raw;
  const arrivalFrac = Math.min(1, T_arrive / segmentSec);

  const motionX: number[] = [];
  const motionY: number[] = [];
  const motionTimes: number[] = [];
  for (let k = 0; k <= N; k++) {
    const rk = rSpawn + (rEnd - rSpawn) * (k / N);
    motionX.push(c * rk);
    motionY.push(sn * rk);
  }

  if (pathFrac < 1 - 1e-9) {
    for (let k = 0; k <= N; k++) {
      motionTimes.push(k / N);
    }
    const motionEase = Array.from({ length: N }, () => "linear" as const);
    return {
      effectiveSegmentSec: segmentSec,
      arrivalFrac,
      motionX,
      motionY,
      motionTimes,
      motionEase,
    };
  }

  for (let k = 0; k <= N; k++) {
    motionTimes.push((k / N) * arrivalFrac);
  }
  motionTimes[motionTimes.length - 1] = arrivalFrac;
  motionX.push(motionX[motionX.length - 1]!);
  motionY.push(motionY[motionY.length - 1]!);
  motionTimes.push(1);

  const motionEase = Array.from({ length: N + 1 }, () => "linear" as const);
  return {
    effectiveSegmentSec: segmentSec,
    arrivalFrac,
    motionX,
    motionY,
    motionTimes,
    motionEase,
  };
}

export type StarAnim =
  | { kind: "static"; x: number; y: number; opacity: number }
  | {
      kind: "moving";
      motionX: number[];
      motionY: number[];
      motionTimes: number[];
      motionEase: readonly "linear"[];
      effectiveSegmentSec: number;
      opacityTimes: number[];
      opacityValues: number[];
      opacityEase: readonly "linear"[];
    };

/** Linear interpolation between keyframe samples (Framer uses linear between points). */
export function interpolatePiecewiseLinear(
  times: readonly number[],
  values: readonly number[],
  t: number,
): number {
  const T = Math.max(0, Math.min(1, t));
  const n = times.length;
  if (n === 0) return 0;
  if (n === 1) return values[0] ?? 0;
  if (T <= times[0]!) return values[0]!;
  if (T >= times[n - 1]!) return values[n - 1]!;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid]! <= T) lo = mid;
    else hi = mid;
  }
  const t0 = times[lo]!;
  const t1 = times[hi]!;
  const u = (T - t0) / (t1 - t0 + 1e-12);
  return values[lo]! + (values[hi]! - values[lo]!) * u;
}

/**
 * Progress `p` in [0, 1] over the segment duration (after delay), matching Framer
 * `transition={{ duration, times, ease: linear }}`.
 */
export function evalMovingAnimAtProgress(
  anim: Extract<StarAnim, { kind: "moving" }>,
  p: number,
): { x: number; y: number; opacity: number } {
  const t = Math.max(0, Math.min(1, p));
  const opacity = interpolatePiecewiseLinear(
    anim.opacityTimes,
    anim.opacityValues,
    t,
  );
  const x = interpolatePiecewiseLinear(
    anim.motionTimes,
    anim.motionX,
    t,
  );
  const y = interpolatePiecewiseLinear(
    anim.motionTimes,
    anim.motionY,
    t,
  );
  return { x, y, opacity };
}

export function computeStarAnim(
  s: Star,
  reduce: boolean,
  w: number,
  h: number,
  segmentCapDurationSec: number,
  cycle: number,
  particleIndex: number,
): StarAnim {
  const minSide = Math.min(w, h);
  const { angle, rSpawn } = spawnOffsetPx(
    s.ux,
    s.uy,
    w,
    h,
    cycle > 0,
  );
  const c = Math.cos(angle);
  const sn = Math.sin(angle);

  const rHole = minSide * 0.186;
  const innerCap = minSide * (0.155 + s.endNorm * 0.095);
  let endR = Math.min(innerCap, rSpawn - 12);
  endR = Math.max(minSide * 0.085, endR);
  if (endR >= rSpawn - 4) {
    endR = Math.max(minSide * 0.085, rSpawn * 0.52);
  }
  const inwardEps = 0.5;
  const upper = rSpawn - inwardEps;
  endR = Math.min(endR, upper);
  endR = Math.max(minSide * 0.085, endR);
  const lower = rHole * 1.02;
  if (upper > lower + 1e-3) {
    endR = Math.max(lower, Math.min(endR, upper));
  }

  if (reduce) {
    const midR = (rSpawn + endR) * 0.48;
    return {
      kind: "static",
      x: c * midR,
      y: sn * midR,
      opacity: s.opacityStart * 0.68,
    };
  }

  const rRef = minSide;
  const {
    effectiveSegmentSec,
    motionX,
    motionY,
    motionTimes,
    motionEase,
    arrivalFrac,
  } = buildRadialDriftKeyframes(
    c,
    sn,
    rSpawn,
    endR,
    rRef,
    segmentCapDurationSec,
    particleIndex,
  );

  const peak = s.opacityStart;
  const { times, values, ease } = opacitySamplesWithFadeOut(
    peak,
    effectiveSegmentSec,
    arrivalFrac,
  );
  return {
    kind: "moving",
    motionX,
    motionY,
    motionTimes,
    motionEase,
    effectiveSegmentSec,
    opacityTimes: times,
    opacityValues: values,
    opacityEase: ease,
  };
}

/**
 * Catch up segment clock when wall time passes segment end (replaces Framer
 * `onAnimationComplete` + fallback timeout).
 */
export function advanceHeroParticleSegments(
  nowMs: number,
  segmentStartMs: number,
  cycle: number,
  s: Star,
  reduce: boolean,
  w: number,
  h: number,
  particleIndex: number,
): { segmentStartMs: number; cycle: number } {
  let t0 = segmentStartMs;
  let c = cycle;
  for (let guard = 0; guard < 128; guard++) {
    const segmentCapSec =
      ((c === 0 ? s.firstTtlMs : TTL_MAX_MS) + s.phaseScatterMs) / 1000;
    const anim = computeStarAnim(s, reduce, w, h, segmentCapSec, c, particleIndex);
    if (anim.kind === "static") {
      return { segmentStartMs: t0, cycle: c };
    }
    const delayMs = c === 0 ? s.cycle0DelayMs : 0;
    const effMs = anim.effectiveSegmentSec * 1000;
    const end = t0 + delayMs + effMs;
    if (nowMs >= end) {
      t0 = end;
      c++;
      continue;
    }
    return { segmentStartMs: t0, cycle: c };
  }
  return { segmentStartMs: t0, cycle: c };
}
