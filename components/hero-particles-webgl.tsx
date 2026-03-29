"use client";

import { useEffect, useRef } from "react";
import {
  STARS,
  TTL_MAX_MS,
  advanceHeroParticleSegments,
  computeStarAnim,
  evalMovingAnimAtProgress,
} from "@/lib/hero-particles";
import {
  HERO_STAR_CANVAS,
  buildHeroParticleFragmentShader,
  buildHeroParticleVertexShader,
} from "@/lib/hero-particles-appearance";

const PARTICLE_COUNT = STARS.length;

const VS_SRC = buildHeroParticleVertexShader();
const FS_SRC = buildHeroParticleFragmentShader();

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("createShader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(err || "compile");
  }
  return sh;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSrc: string,
  fsSrc: string,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  if (!prog) throw new Error("createProgram");
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(err || "link");
  }
  return prog;
}

const QUAD_CORNERS = new Float32Array([
  -1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
]);

function drawStarParticle2d(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
): void {
  const c = HERO_STAR_CANVAS;
  const R = size * 0.5;
  const o = Math.max(0, Math.min(1, opacity));
  ctx.save();
  const g = ctx.createRadialGradient(
    x,
    y,
    R * c.bloomInnerR,
    x,
    y,
    R * c.bloomOuterR,
  );
  for (const s of c.bloomStops) {
    g.addColorStop(s.t, `rgba(255,255,255,${s.a * o})`);
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R * c.bloomOuterR, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(c.rayLineWidthMin, R * c.rayLineWidthR);
  const r0 = R * c.rayInnerR;
  const r1 = R * c.rayOuterR;
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2;
    const x0 = x + Math.cos(ang) * r0;
    const y0 = y + Math.sin(ang) * r0;
    const x1 = x + Math.cos(ang) * r1;
    const y1 = y + Math.sin(ang) * r1;
    const lg = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const gs of c.gradientStops) {
      const [rc, gc, bc, alpha] = gs.rgba;
      lg.addColorStop(gs.t, `rgba(${rc},${gc},${bc},${alpha * o})`);
    }
    ctx.strokeStyle = lg;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  ctx.globalAlpha = o;
  ctx.beginPath();
  ctx.arc(x, y, R * c.coreR, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.fill();
  ctx.restore();
}

function fillInstanceData(
  nowMs: number,
  segmentStartMs: Float64Array,
  cycle: Uint32Array,
  reduce: boolean,
  w: number,
  h: number,
  out: Float32Array,
): void {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const s = STARS[i]!;
    const adv = advanceHeroParticleSegments(
      nowMs,
      segmentStartMs[i]!,
      cycle[i]!,
      s,
      reduce,
      w,
      h,
      i,
    );
    segmentStartMs[i] = adv.segmentStartMs;
    cycle[i] = adv.cycle;

    const c = cycle[i]!;
    const t0 = segmentStartMs[i]!;
    const segmentCapSec =
      ((c === 0 ? s.firstTtlMs : TTL_MAX_MS) + s.phaseScatterMs) / 1000;
    const anim = computeStarAnim(s, reduce, w, h, segmentCapSec, c, i);

    const base = i * 4;
    if (anim.kind === "static") {
      out[base] = anim.x;
      out[base + 1] = anim.y;
      out[base + 2] = s.size;
      out[base + 3] = anim.opacity;
      continue;
    }

    const delayMs = c === 0 ? s.cycle0DelayMs : 0;
    const effMs = anim.effectiveSegmentSec * 1000;
    const tw = nowMs - t0;
    let p = 0;
    if (tw >= delayMs && effMs > 1e-6) {
      p = (tw - delayMs) / effMs;
    }
    p = Math.max(0, Math.min(1, p));
    const { x, y, opacity } = evalMovingAnimAtProgress(anim, p);
    out[base] = x;
    out[base + 1] = y;
    out[base + 2] = s.size;
    out[base + 3] = opacity;
  }
}

export type HeroParticlesCanvasProps = {
  width: number;
  height: number;
  devicePixelRatio: number;
  reduce: boolean;
  /** When false, animation loop is paused (e.g. hero off-screen). */
  visible: boolean;
};

export function HeroParticlesCanvas({
  width: w,
  height: h,
  devicePixelRatio: dpr,
  reduce,
  visible,
}: HeroParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const segmentStartMsRef = useRef<Float64Array | null>(null);
  const cycleRef = useRef<Uint32Array | null>(null);
  const rafRef = useRef<number>(0);
  const glStateRef = useRef<{
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    cornerBuffer: WebGLBuffer;
    instanceBuffer: WebGLBuffer;
    instanceFloats: Float32Array;
    uHalfSize: WebGLUniformLocation;
    bw: number;
    bh: number;
  } | null>(null);
  const ctx2dRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const seg = new Float64Array(PARTICLE_COUNT);
    const now = performance.now();
    seg.fill(now);
    segmentStartMsRef.current = seg;
    cycleRef.current = new Uint32Array(PARTICLE_COUNT);
  }, []);

  useEffect(() => {
    const seg = segmentStartMsRef.current;
    const cyc = cycleRef.current;
    if (!seg || !cyc) return;
    const t = performance.now();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seg[i] = t;
      cyc[i] = 0;
    }
  }, [w, h]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w < 2 || h < 2) return;

    const bw = Math.max(1, Math.floor(w * dpr));
    const bh = Math.max(1, Math.floor(h * dpr));
    canvas.width = bw;
    canvas.height = bh;

    glStateRef.current = null;
    ctx2dRef.current = null;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    if (gl) {
      try {
        const program = createProgram(gl, VS_SRC, FS_SRC);
        const vao = gl.createVertexArray();
        if (!vao) throw new Error("vao");
        gl.bindVertexArray(vao);

        const cornerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, QUAD_CORNERS, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(0, 0);

        const instanceBuffer = gl.createBuffer();
        const instanceFloats = new Float32Array(PARTICLE_COUNT * 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, instanceFloats.byteLength, gl.DYNAMIC_DRAW);

        const stride = 16;
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribDivisor(1, 1);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 8);
        gl.vertexAttribDivisor(2, 1);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 12);
        gl.vertexAttribDivisor(3, 1);

        gl.bindVertexArray(null);

        const uHalfSize = gl.getUniformLocation(program, "u_halfSize");
        if (!uHalfSize) throw new Error("u_halfSize");

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        glStateRef.current = {
          gl,
          program,
          vao,
          cornerBuffer,
          instanceBuffer,
          instanceFloats,
          uHalfSize,
          bw,
          bh,
        };
      } catch (e) {
        console.error("[hero-particles] WebGL program failed", e);
        glStateRef.current = null;
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    }

    if (!glStateRef.current) {
      const c2 =
        canvas.getContext("2d", { alpha: true }) ??
        canvas.getContext("2d");
      ctx2dRef.current = c2;
    }

    return () => {
      if (glStateRef.current) {
        const st = glStateRef.current;
        st.gl.deleteProgram(st.program);
        st.gl.deleteVertexArray(st.vao);
        st.gl.deleteBuffer(st.cornerBuffer);
        st.gl.deleteBuffer(st.instanceBuffer);
        glStateRef.current = null;
      }
      ctx2dRef.current = null;
    };
  }, [w, h, dpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const seg = segmentStartMsRef.current;
    const cyc = cycleRef.current;
    if (!canvas || !seg || !cyc || w < 2 || h < 2) return;

    const bw = Math.max(1, Math.floor(w * dpr));
    const bh = Math.max(1, Math.floor(h * dpr));
    const halfW = w / 2;
    const halfH = h / 2;
    const instanceScratch = new Float32Array(PARTICLE_COUNT * 4);

    const loop = (now: number) => {
      if (!visibleRef.current) {
        return;
      }

      const glSt = glStateRef.current;
      if (glSt) {
        fillInstanceData(now, seg, cyc, reduce, w, h, glSt.instanceFloats);
        glSt.gl.bindVertexArray(glSt.vao);
        glSt.gl.bindBuffer(glSt.gl.ARRAY_BUFFER, glSt.instanceBuffer);
        glSt.gl.bufferSubData(glSt.gl.ARRAY_BUFFER, 0, glSt.instanceFloats);
        glSt.gl.viewport(0, 0, glSt.bw, glSt.bh);
        glSt.gl.clearColor(0, 0, 0, 0);
        glSt.gl.clear(glSt.gl.COLOR_BUFFER_BIT);
        glSt.gl.useProgram(glSt.program);
        glSt.gl.uniform2f(glSt.uHalfSize, halfW, halfH);
        glSt.gl.drawArraysInstanced(glSt.gl.TRIANGLES, 0, 6, PARTICLE_COUNT);
        glSt.gl.bindVertexArray(null);
      } else {
        const ctx2d = ctx2dRef.current;
        if (ctx2d) {
          fillInstanceData(now, seg, cyc, reduce, w, h, instanceScratch);
          ctx2d.setTransform(1, 0, 0, 1, 0, 0);
          ctx2d.clearRect(0, 0, bw, bh);
          ctx2d.setTransform(dpr, 0, 0, dpr, halfW * dpr, halfH * dpr);
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const base = i * 4;
            const x = instanceScratch[base]!;
            const y = instanceScratch[base + 1]!;
            const size = instanceScratch[base + 2]!;
            const opacity = instanceScratch[base + 3]!;
            drawStarParticle2d(ctx2d, x, y, size, opacity);
          }
          ctx2d.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    if (visible) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, reduce, w, h, dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] size-full"
      aria-hidden
    />
  );
}
