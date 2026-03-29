"use client";

import type { ComponentProps } from "react";
import { GRADIENT_BIG, GRADIENT_SMALL } from "@/lib/hero-particles";

/** Design reference: hero central gradient orb (box before blur). */
export const HERO_ORB_CONTAINER_PX = 406;
export const HERO_ORB_BLUR_PX = 10;
export const HERO_ORB_BIG_PX = 544.5;
export const HERO_ORB_SMALL_PX = 420.2;

type HeroCentralOrbProps = {
  /**
   * Uniform scale vs the hero reference (406px container).
   * Default `1` matches the hero section; e.g. `58 / HERO_ORB_CONTAINER_PX` for the Services lead mockup.
   */
  scale?: number;
  /** Blur radius in px. Default: `HERO_ORB_BLUR_PX * scale`. */
  blurPx?: number;
  /** Opacity of the blurred orb layer. Default `0.6` (hero); Framer services lead uses `1`. */
  layerOpacity?: number;
  /** When true, disables counter-rotation CSS animations (deterministic screenshots / reduced-motion parity). */
  disableMotion?: boolean;
  className?: string;
  style?: ComponentProps<"div">["style"];
};

/**
 * Counter-rotating gradient discs + blur (same as the hero background center glow).
 */
export function HeroCentralOrb({
  scale = 1,
  blurPx: blurPxProp,
  layerOpacity,
  disableMotion = false,
  className,
  style,
}: HeroCentralOrbProps) {
  const container = HERO_ORB_CONTAINER_PX * scale;
  const blurPx = blurPxProp ?? HERO_ORB_BLUR_PX * scale;
  const big = HERO_ORB_BIG_PX * scale;
  const small = HERO_ORB_SMALL_PX * scale;
  const bigOff = big / 2;
  const smallOff = small / 2;

  return (
    <div
      className={["pointer-events-none relative", className].filter(Boolean).join(" ")}
      aria-hidden
      style={{
        width: container,
        height: container,
        filter: `blur(${blurPx}px)`,
        opacity: layerOpacity ?? 0.6,
        ...style,
      }}
    >
      <div
        className={
          disableMotion
            ? "absolute rounded-full animate-none"
            : "absolute rounded-full animate-hero-orb-slow"
        }
        style={{
          left: "50%",
          top: "50%",
          width: big,
          height: big,
          marginLeft: -bigOff,
          marginTop: -bigOff,
          background: GRADIENT_BIG,
        }}
      />
      <div
        className={
          disableMotion
            ? "absolute rounded-full animate-none"
            : "absolute rounded-full animate-hero-orb-fast"
        }
        style={{
          left: "50%",
          top: "50%",
          width: small,
          height: small,
          marginLeft: -smallOff,
          marginTop: -smallOff,
          background: GRADIENT_SMALL,
        }}
      />
    </div>
  );
}
