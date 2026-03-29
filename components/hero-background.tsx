"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  startTransition,
} from "react";
import { useReducedMotion } from "framer-motion";
import { readHeroParticleDebugMode, debugLogParticleTimings } from "@/lib/hero-particles";
import { HeroCentralOrb } from "@/components/hero-central-orb";
import { HeroParticlesCanvas } from "@/components/hero-particles-webgl";

export function HeroBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(() =>
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
  );
  const [heroVisible, setHeroVisible] = useState(true);
  const [debugStars, setDebugStars] = useState(false);
  const timingDebugOnceRef = useRef(false);
  const prefersReducedMotion = useReducedMotion() === true;

  useEffect(() => {
    const m = readHeroParticleDebugMode();
    startTransition(() => {
      setDebugStars(m.enabled);
    });
  }, []);

  useEffect(() => {
    if (!debugStars || timingDebugOnceRef.current) return;
    timingDebugOnceRef.current = true;
    debugLogParticleTimings();
  }, [debugStars]);

  useEffect(() => {
    const onResize = () => setDevicePixelRatio(window.devicePixelRatio);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && r.height > 1) setDims({ w: r.width, h: r.height });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setHeroVisible(e.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        <HeroCentralOrb />
      </div>

      {dims && (
        <HeroParticlesCanvas
          width={dims.w}
          height={dims.h}
          devicePixelRatio={devicePixelRatio}
          reduce={prefersReducedMotion}
          visible={heroVisible}
        />
      )}
    </div>
  );
}
