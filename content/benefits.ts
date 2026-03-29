import {
  Zap,
  Heart,
  Building2,
  Shield,
  TrendingUp,
  Scaling,
} from "lucide-react";

export const BENEFITS = [
  {
    icon: Zap,
    title: "Fast Results",
    description:
      "While others spend months planning, we deliver working solutions within weeks. You can see first results in as little as 2–3 weeks.",
  },
  {
    icon: Heart,
    title: "Human-Centered Approach",
    description:
      "We don't just provide technology — we become your partner. Every client gets a dedicated contact who knows your business and helps you personally.",
  },
  {
    icon: Building2,
    title: "SMB Specialists",
    description:
      "We understand the local challenges: bureaucracy, labor shortages, and cost sensitivity. Our solutions address these real-world problems head-on.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description:
      "GDPR-compliant solutions, secure data storage, and full transparency in data handling.",
  },
  {
    icon: TrendingUp,
    title: "Real ROI Focus",
    description:
      "Every solution we build targets measurable business outcomes. We don't sell technology — we sell efficiency.",
  },
  {
    icon: Scaling,
    title: "Scalable Solutions",
    description:
      "Start small and expand gradually. Our solutions grow alongside your business.",
  },
] as const;
