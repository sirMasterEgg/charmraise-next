import { TRUST_HEADLINE, TRUST_LOGOS } from "@/content/trust-bar";

export function TrustBar() {
  return (
    <section
      data-section="trust"
      className="border-y border-white/[0.06] bg-black py-12"
    >
      <p className="mx-auto max-w-[min(100%,36rem)] px-6 text-center text-sm font-medium text-text-secondary md:max-w-none">
        {TRUST_HEADLINE}
      </p>
      {TRUST_LOGOS.length > 0 ? (
        <div className="mx-auto mt-8 flex max-w-7xl justify-center overflow-hidden px-6">
          <ul className="flex flex-nowrap items-center justify-center gap-10 sm:gap-14 md:gap-16">
            {TRUST_LOGOS.map((logo) => (
              <li key={logo.name}>
                {logo.href ? (
                  <a
                    href={logo.href}
                    className="text-sm font-semibold tracking-tight text-white/90 hover:text-white"
                  >
                    {logo.name}
                  </a>
                ) : (
                  <span className="text-sm font-semibold tracking-tight text-white/90">
                    {logo.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
