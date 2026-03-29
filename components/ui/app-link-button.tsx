import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary-glass" | "outline" | "gradient" | "white";

const variantClasses: Record<Variant, string> = {
  primary:
    "inline-flex items-center justify-center gap-[10px] rounded-md bg-accent px-[13px] py-[9px] text-[15px] font-medium tracking-[-0.6px] text-white shadow-hero-cta transition-transform hover:scale-[1.02]",
  "secondary-glass":
    "inline-flex items-center justify-center gap-[10px] rounded-md border border-transparent bg-surface-glass px-[13px] py-[9px] text-[15px] font-medium tracking-[-0.6px] text-white shadow-hero-cta transition-colors hover:bg-surface-glass-hover",
  outline:
    "inline-flex items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/[0.08]",
  gradient:
    "relative inline-flex items-center justify-center rounded-full py-2.5 px-5 text-white text-sm font-medium tracking-tight border border-[#a64800] bg-gradient-to-r from-[#FF7F1E] to-[#BF58FF] shadow-[0px_4px_20px_0px_rgba(255,127,30,0.38)] transition-all hover:scale-[1.03] hover:shadow-[0px_6px_28px_0px_rgba(255,127,30,0.55)]",
  white:
    "inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85",
};

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

type AppLinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
};

export function AppLinkButton({
  href,
  children,
  variant = "primary",
  className = "",
  external,
}: AppLinkButtonProps) {
  const base = variantClasses[variant];
  const merged = `${base} ${className}`.trim();
  const internal = external !== true && isInternalHref(href);

  if (internal) {
    return (
      <Link href={href} className={merged}>
        {children}
        {variant === "gradient" && (
          <span className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0px_3px_0px_0px_rgba(212,229,202,0.19)]" />
        )}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={merged}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      {variant === "gradient" && (
        <span className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0px_3px_0px_0px_rgba(212,229,202,0.19)]" />
      )}
    </a>
  );
}
