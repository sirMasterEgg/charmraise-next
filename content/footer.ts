import { Camera, Globe, Link2, MessageCircle } from "lucide-react";

export const FOOTER_SECTION_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Case studies", href: "#cases" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const FOOTER_PAGE_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "404", href: "/404" },
] as const;

export const FOOTER_SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/", icon: Camera },
  { label: "Facebook", href: "https://facebook.com/", icon: Globe },
  { label: "Linkedin", href: "https://linkedin.com/", icon: Link2 },
  { label: "Twitter", href: "https://x.com/", icon: MessageCircle },
] as const;
