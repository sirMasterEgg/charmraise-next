"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand-logo";
import { AppLinkButton } from "@/components/ui/app-link-button";
import { NAV_ITEMS } from "@/content/nav";
import { BOOKING_URL } from "@/lib/site";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative z-50 w-full shrink-0">
      <nav className="bg-black">
        <div className="mx-auto flex min-h-[65px] w-full max-w-[1200px] items-center justify-between px-6 py-[10px] xl:px-0">
          <Link href="/">
            <BrandWordmark />
          </Link>

          <div className="hidden items-center gap-16 md:flex">
            {NAV_ITEMS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white transition-opacity hover:opacity-80"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <AppLinkButton
              href={BOOKING_URL}
              variant="gradient"
              className="text-xs font-normal"
            >
              Free Consultation
            </AppLinkButton>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-text-primary md:hidden"
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full border-b border-border bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {NAV_ITEMS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-white/90 transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
              <AppLinkButton
                href={BOOKING_URL}
                variant="gradient"
                className="mt-2 w-full justify-center text-xs font-normal"
              >
                Free Consultation
              </AppLinkButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
