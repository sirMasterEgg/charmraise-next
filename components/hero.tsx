"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HeroBackground } from "@/components/hero-background";
import { Navbar } from "@/components/navbar";
import { AppLinkButton } from "@/components/ui/app-link-button";
import { allowEnterMotion } from "@/lib/motion";
import { CONTACT_PATH } from "@/lib/site";

export function Hero() {
  const allowEnter = allowEnterMotion(useReducedMotion());
  const enterY = (y: number) =>
    allowEnter ? { opacity: 0, y } : { opacity: 1, y: 0 };
  const enterTransition = (duration: number, delay = 0) =>
    allowEnter ? { duration, delay } : { duration: 0 };

  return (
    <section
      data-section="hero"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black"
    >
      <Navbar />

      <div className="relative flex flex-1 flex-col justify-start px-0 pb-28 pt-24 md:pb-32 lg:pt-[193px]">
        <HeroBackground />

        <div className="relative mx-auto w-full max-w-[900px] px-6 text-center lg:px-0">
          <motion.div
            initial={enterY(20)}
            animate={{ opacity: 1, y: 0 }}
            transition={enterTransition(0.5)}
            className="flex justify-center"
          >
            <div className="inline-flex h-[28.8px] overflow-hidden rounded-[20px] bg-surface-glass text-[14px] font-medium leading-[16.8px] tracking-[-0.28px] text-white">
              <span className="relative flex items-center rounded-full border border-[#a64800] bg-gradient-to-r from-[#FF7F1E] to-[#BF58FF] px-3 py-[6px] text-white shadow-[0px_2px_10px_0px_rgba(255,127,30,0.38)]">
                New
                <span className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0px_2px_0px_0px_rgba(212,229,202,0.19)]" />
              </span>
              <span className="flex items-center px-3 py-[6px] text-white">
                Powered by intelligent automation, engineered for OnlyFans growth
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={enterY(30)}
            animate={{ opacity: 1, y: 0 }}
            transition={enterTransition(0.6, 0.1)}
            className="mx-auto mt-6 max-w-[900px] text-[clamp(1.75rem,5.5vw,4.375rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary md:leading-[1.08] lg:text-[70px] lg:leading-[77px] lg:tracking-[-2.2px]"
          >
            Automated. Intelligent. Secure.
          </motion.h1>

          <motion.p
            initial={enterY(20)}
            animate={{ opacity: 1, y: 0 }}
            transition={enterTransition(0.5, 0.25)}
            className="mx-auto mt-2.5 max-w-[600px] text-lg font-medium leading-[27px] tracking-[-0.36px] text-text-hero-subtle"
          >
            CharmRaise is not just a tool. It’s a Revenue Engine.
          </motion.p>

          <motion.div
            initial={enterY(20)}
            animate={{ opacity: 1, y: 0 }}
            transition={enterTransition(0.5, 0.4)}
            className="mt-[27px] flex flex-row flex-wrap items-center justify-center gap-[15px]"
          >
            <AppLinkButton href={CONTACT_PATH} variant="gradient">
              Contact
              <ArrowUpRight className="size-[15px]" strokeWidth={2.25} />
            </AppLinkButton>
            <AppLinkButton href="#services" variant="white">
              Services
              <ArrowUpRight
                className="size-[15px] opacity-80"
                strokeWidth={2.25}
              />
            </AppLinkButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
