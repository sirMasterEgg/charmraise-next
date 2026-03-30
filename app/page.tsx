import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { TrustBar } from "@/components/trust-bar";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrustBar />
        <Services />
      </main>
    </>
  );
}
