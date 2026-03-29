import Image from "next/image";
import { SITE_BRAND } from "@/lib/site";

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/charmraise-logo.webp"
      alt={SITE_BRAND}
      width={872}
      height={112}
      className={`h-[30px] w-[140px] object-contain object-center -translate-y-1 ${className ?? ""}`}
      priority
    />
  );
}
