/** Framer-aligned copy for Services “graphics” mockups */

export const WORKFLOW_TOP = {
  allTasks: "All Tasks",
  waiting: "Waiting for approval",
} as const;

export type WorkflowIconKey =
  | "currency"
  | "users"
  | "calendar"
  | "alarm"
  | "clock"
  | "check"
  | "x"
  | "list"
  | "loader";

/** Order and copy from live Framer export (unlimited-booking-677378.framer.app). */
export const WORKFLOW_TASKS: readonly {
  title: string;
  status: string;
  left: WorkflowIconKey;
  right: WorkflowIconKey;
}[] = [
  { title: "Payroll management", status: "Due on 2nd july", left: "currency", right: "clock" },
  { title: "Employee Tracking", status: "2 days ago", left: "users", right: "check" },
  { title: "Social media post", status: "Cancelled by user", left: "calendar", right: "x" },
  { title: "Lead list", status: "70% prepared", left: "list", right: "loader" },
  { title: "Payment reminder", status: "sent to selected clients", left: "alarm", right: "check" },
];

export const LEAD_CHAT = {
  title: "What can I help with?",
  /** Live Framer copy uses “Weather” (reference site). */
  body:
    "Weather you want help in  customer handling or make changes in your system just give me command",
  addDocument: "Add document",
  actions: [
    { id: "analyze", label: "Analyze" },
    { id: "generate", label: "Generate Image" },
    { id: "research", label: "research" },
  ] as const,
} as const;

/** Phrases cycled by the Lead mockup typing animation (Framer reference). */
export const LEAD_TYPING_PHRASES = [
  "Generate a invoice",
  "Schedule a meeting",
  "Draft an email campaign",
] as const;

/**
 * When `prefers-reduced-motion` is on, Framer shows a mid-typing frame (design screenshots).
 * Match that static string so the mockup aligns with the reference capture.
 */
export const LEAD_TYPING_REDUCED_MOTION = "Generate a invoic" as const;

export const SALES_EMAIL = {
  title: "E-mail Sending..",
  filters: ["LinkedIn", "IT services", "Founders"] as const,
  statusTabs: ["Draft", "Schedule", "Sent"] as const,
} as const;

export type SalesLead = {
  name: string;
  role: string;
  email: string;
  company: string;
};

export const SALES_LEADS: readonly SalesLead[] = [
  { name: "Jack Daniel", role: "Founder", email: "justin@main.com", company: "Xavier LLC" },
  { name: "Gorge Chapel", role: "Founder", email: "gorge@mail.com", company: "Chapel LLC" },
  { name: "Mike Tylor", role: "Founder", email: "mike@Cmb.com", company: "CMB LLC" },
  { name: "Thomas Shelby", role: "Founder", email: "Thimas@Sby.com", company: "Shelby.co" },
];

/** Inline avatar (Framer data URL) — simple user silhouette */
export const LEAD_AVATAR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M16.5 7.063C16.5 10.258 14.57 13 12 13S7.5 10.258 7.5 7.062C7.5 3.868 9.16 2 12 2s4.5 1.867 4.5 5.063ZM4.102 20.142C4.487 20.6 6.145 22 12 22s7.898-1.4 8.286-1.858c.072-.089.105-.203.09-.319-.088-.882-.882-4.826-8.376-4.826S4.1 18.944 4.011 19.826c-.015.116.018.23.091.316Z' fill='rgb(255,255,255)'/%3E%3C/svg%3E";

export type CustomMeeting = {
  title: string;
  time: string;
};

/** Mo–Su: Framer-style — different rows per day (empty = “no meeting” state). */
export const CUSTOM_SCHEDULE_BY_DAY: readonly (readonly CustomMeeting[])[] = [
  [
    { title: "Efficiency testing", time: "10:00 am to 10:30 am" },
    { title: "Lead gen. tutorial", time: "06:00 pm to 06:30 pm" },
  ],
  [{ title: "Sprint planning", time: "09:00 am to 10:00 am" }],
  [],
  [
    { title: "Client review", time: "02:00 pm to 03:00 pm" },
    { title: "Team stand-up", time: "04:00 pm to 04:15 pm" },
  ],
  [{ title: "Deploy window", time: "11:00 am to 12:00 pm" }],
  [],
  [{ title: "Weekly retro", time: "05:00 pm to 05:45 pm" }],
] as const;

export const CUSTOM_PROJECT = {
  greeting: "Hey David!",
  subtitle: "Here is your Custom project & schedule",
  ongoingLabel: "On going project : ",
  projectTitle: "Customer Support Chatbot",
  progressLabel: "90% Finished",
  progressPct: 0.9,
  scheduleTitle: "Schedule",
  days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const,
  /** Framer highlights Monday */
  activeDayIndex: 0,
  scheduleByDay: CUSTOM_SCHEDULE_BY_DAY,
} as const;
