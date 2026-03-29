export const PLANS = [
  {
    name: "sziaAI Start",
    monthlyPrice: 37,
    annualPrice: 37,
    description:
      "Perfect for small teams just getting started with AI automation.",
    features: [
      "Basic workflow automation",
      "AI-powered personal assistant",
      "Standard analytics & reporting",
      "Email & chat support",
      "Up to 3 AI integrations",
    ],
    cta: "Choose this plan",
    popular: false,
  },
  {
    name: "sziaAI Business",
    monthlyPrice: 75,
    annualPrice: 75,
    description:
      "Perfect for small businesses starting with AI automation.",
    features: [
      "Advanced workflow automation",
      "AI-driven sales & marketing tools",
      "Enhanced data analytics & insights",
      "Priority customer support",
      "Up to 10 AI integrations",
    ],
    cta: "Choose this plan",
    popular: true,
  },
  {
    name: "sziaAI Pro",
    monthlyPrice: null,
    annualPrice: null,
    description:
      "Perfect for small businesses starting with AI automation.",
    features: [
      "Fully customizable AI automation",
      "Dedicated AI business consultant",
      "Enterprise-grade compliance",
      "24/7 VIP support",
      "Unlimited AI integrations",
    ],
    cta: "Schedule a call",
    popular: false,
  },
] as const;
