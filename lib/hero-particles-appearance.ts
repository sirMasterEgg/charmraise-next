/**
 * Central tuning for hero star **rendering** (WebGL + Canvas2D) and **point size**
 * in the particle pool. Adjust values here rather than hunting through components.
 */

/** Multiplies each pool particle’s `size` (px). Lower = smaller stars overall. */
export const HERO_STAR_POINT_SIZE_SCALE = 0.85;

/**
 * Vertex shader: quad extent in multiples of particle size (long diffraction spikes).
 * Lower = smaller on-screen footprint for the same pool `size`.
 */
export const HERO_STAR_GL_QUAD_SCALE = 5.2;

/** Fragment: discard beyond this normalized radius (quad inscribed circle ~√2). */
export const HERO_STAR_GL_DISCARD_R = 1.415;

/** Core disc: smoothstep(1, coreEdge, r) — smaller = tinier bright center. */
export const HERO_STAR_GL_CORE_EDGE = 0.072;

/** Bloom ring: `smoothstep(0, BLOOM_OUTER, r)` — must use edge0 < edge1 in GLSL. */
export const HERO_STAR_GL_BLOOM_OUTER = 0.38;
export const HERO_STAR_GL_BLOOM_STRENGTH = 0.42;
export const HERO_STAR_GL_BLOOM_INNER_CUT = 0.11;

/** Cross spikes: pow(|cos(2θ)|, n) — higher n = thinner rays. */
export const HERO_STAR_GL_CROSS_POWER = 38;

/** Spike length masks (normalized r). */
export const HERO_STAR_GL_SPIKE_LEN_A = 0.1;
export const HERO_STAR_GL_SPIKE_LEN_B = 0.2;
export const HERO_STAR_GL_SPIKE_LEN_C = 0.88;
export const HERO_STAR_GL_SPIKE_LEN_D = 1.36;

/** Tip falloff: 1 - smoothstep(tipA, tipB, r). */
export const HERO_STAR_GL_TIP_FADE_A = 0.55;
export const HERO_STAR_GL_TIP_FADE_B = 1.32;

/** Overall spike intensity multiplier. */
export const HERO_STAR_GL_SPIKE_STRENGTH = 0.92;

/** Diffraction tint: phase = theta * θMul + r * rMul. */
export const HERO_STAR_GL_TINT_THETA_MUL = 2.0;
export const HERO_STAR_GL_TINT_R_MUL = 7.0;

/** Tint RGB channel offsets (radians) for sin(ph + offset). */
export const HERO_STAR_GL_TINT_PHASE_R = 0.0;
export const HERO_STAR_GL_TINT_PHASE_G = 2.1;
export const HERO_STAR_GL_TINT_PHASE_B = 4.2;

/** Tint base + amplitude per channel. */
export const HERO_STAR_GL_TINT_BASE = [0.72, 0.75, 0.78] as const;
export const HERO_STAR_GL_TINT_AMP = [0.28, 0.25, 0.28] as const;

export const HERO_STAR_GL_RGB_EPSILON = 1e-4;

/** Canvas2D fallback (proportional to R = size/2). */
export const HERO_STAR_CANVAS = {
  bloomInnerR: 0.45,
  bloomOuterR: 2.75,
  bloomStops: [
    { t: 0, a: 0.55 },
    { t: 0.12, a: 0.22 },
    { t: 0.35, a: 0.1 },
    { t: 0.65, a: 0.04 },
    { t: 1, a: 0 },
  ] as const,
  rayLineWidthMin: 0.35,
  rayLineWidthR: 0.045,
  rayInnerR: 0.12,
  rayOuterR: 2.55,
  coreR: 0.38,
  gradientStops: [
    { t: 0, rgba: [255, 250, 255, 0.85] as const },
    { t: 0.35, rgba: [200, 220, 255, 0.45] as const },
    { t: 0.65, rgba: [255, 200, 210, 0.22] as const },
    { t: 1, rgba: [255, 255, 255, 0.06] as const },
  ],
} as const;

/**
 * GLSL ES 3.00 float literal for injected code: `pow(x, 38)` is invalid (no int overload);
 * `38.0` is required. Also avoids `sin(ph + 0)` vs `0.0` issues.
 */
function glf(n: number): string {
  const s = String(n);
  if (/[eE]/.test(s)) return s;
  if (s.includes(".")) return s;
  return `${s}.0`;
}

export function buildHeroParticleVertexShader(): string {
  const q = glf(HERO_STAR_GL_QUAD_SCALE);
  return `#version 300 es
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec2 a_offset;
layout(location = 2) in float a_size;
layout(location = 3) in float a_opacity;

uniform vec2 u_halfSize;

out vec2 v_local;
out float v_opacity;

void main() {
  vec2 corner = a_corner * a_size * 0.5 * ${q};
  vec2 pos = a_offset + corner;
  v_local = a_corner;
  v_opacity = a_opacity;
  float ndc_x = pos.x / u_halfSize.x;
  float ndc_y = -pos.y / u_halfSize.y;
  gl_Position = vec4(ndc_x, ndc_y, 0.0, 1.0);
}
`;
}

export function buildHeroParticleFragmentShader(): string {
  const d = glf(HERO_STAR_GL_DISCARD_R);
  const ce = glf(HERO_STAR_GL_CORE_EDGE);
  const bo = glf(HERO_STAR_GL_BLOOM_OUTER);
  const bs = glf(HERO_STAR_GL_BLOOM_STRENGTH);
  const bic = glf(HERO_STAR_GL_BLOOM_INNER_CUT);
  const cp = glf(HERO_STAR_GL_CROSS_POWER);
  const sla = glf(HERO_STAR_GL_SPIKE_LEN_A);
  const slb = glf(HERO_STAR_GL_SPIKE_LEN_B);
  const slc = glf(HERO_STAR_GL_SPIKE_LEN_C);
  const sld = glf(HERO_STAR_GL_SPIKE_LEN_D);
  const tfa = glf(HERO_STAR_GL_TIP_FADE_A);
  const tfb = glf(HERO_STAR_GL_TIP_FADE_B);
  const ss = glf(HERO_STAR_GL_SPIKE_STRENGTH);
  const tm = glf(HERO_STAR_GL_TINT_THETA_MUL);
  const rm = glf(HERO_STAR_GL_TINT_R_MUL);
  const pr = glf(HERO_STAR_GL_TINT_PHASE_R);
  const pg = glf(HERO_STAR_GL_TINT_PHASE_G);
  const pb = glf(HERO_STAR_GL_TINT_PHASE_B);
  const tb0 = glf(HERO_STAR_GL_TINT_BASE[0]);
  const tb1 = glf(HERO_STAR_GL_TINT_BASE[1]);
  const tb2 = glf(HERO_STAR_GL_TINT_BASE[2]);
  const ta0 = glf(HERO_STAR_GL_TINT_AMP[0]);
  const ta1 = glf(HERO_STAR_GL_TINT_AMP[1]);
  const ta2 = glf(HERO_STAR_GL_TINT_AMP[2]);
  const eps = glf(HERO_STAR_GL_RGB_EPSILON);

  return `#version 300 es
precision highp float;
in vec2 v_local;
in float v_opacity;
out vec4 outColor;

void main() {
  float r = length(v_local);
  if (r > ${d}) discard;
  float theta = atan(v_local.y, v_local.x);

  float aCore = smoothstep(1.0, ${ce}, r);
  // Valid smoothstep only (edge0 < edge1). Same intent as old (1 - smoothstep(0, bo, r)) * …
  float aBloom =
    (1.0 - smoothstep(0.0, ${bo}, r)) * ${bs} * (1.0 - smoothstep(0.0, ${bic}, r));

  float cross = pow(abs(cos(2.0 * theta)), ${cp});
  float spikeLen =
    smoothstep(${sla}, ${slb}, r) * (1.0 - smoothstep(${slc}, ${sld}, r));
  float tipFade = 1.0 - smoothstep(${tfa}, ${tfb}, r);
  float aSpike = cross * spikeLen * tipFade * ${ss};

  float ph = theta * ${tm} + r * ${rm};
  vec3 tint = vec3(
    ${tb0} + ${ta0} * sin(ph + ${pr}),
    ${tb1} + ${ta1} * sin(ph + ${pg}),
    ${tb2} + ${ta2} * sin(ph + ${pb})
  );

  float sum = aCore + aBloom + aSpike;
  float a = min(1.0, sum) * v_opacity;
  vec3 white = vec3(1.0);
  vec3 rgb = (white * (aCore + aBloom) + tint * aSpike) / max(sum, ${eps});
  outColor = vec4(rgb, a);
}
`;
}
