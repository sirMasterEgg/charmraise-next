export const SERVICES_CONTENT = [
  {
    id: "crm",
    category: "Workflow Automation",
    title: "CRM Automation",
    description:
      "Automatic customer data updates, personalized communication, and optimized sales processes. You have more time for relationship building while AI handles the administration.",
    tags: ["Internal Task Bots", "100+ Automations"],
  },
  {
    id: "lead",
    category: "AI Assistant",
    title: "Lead Automation",
    description:
      "Automatic identification, scoring, and follow-up of new prospects. Never lose a potential customer again — AI works for you 24/7.",
    tags: ["Summaries", "Scheduling", "Many more"],
  },
  {
    id: "sales",
    category: "Sales & Marketing",
    title: "Accelerate Sales Growth",
    description:
      "AI tools for lead generation, personalized outreach, and automated content creation that scales your sales efforts and builds stronger brand presence.",
    tags: ["Leads", "Content", "Social post"],
  },
  {
    id: "custom",
    category: "Custom Projects",
    title: "Build Smarter Systems",
    description:
      "Whether you're starting from scratch or enhancing an existing system, we offer strategic consulting and develop custom AI projects aligned with your unique goals.",
    tags: ["Strategy", "Custom AI", "Consulting"],
  },
] as const;

export type ServiceContentId = (typeof SERVICES_CONTENT)[number]["id"];
