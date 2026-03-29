import type { WorkflowIconKey } from "@/content/service-graphics";

/** Served from `public/framer-assets/services/` (see `scripts/fetch-framer-service-assets.mjs`). */
const BASE = "/framer-assets/services";

export function workflowIconSrc(key: WorkflowIconKey): string {
  return `${BASE}/workflow/${key}.svg`;
}

export const LEAD_ASSETS = {
  send: `${BASE}/lead/send.svg`,
  addDocument: `${BASE}/lead/add-document.svg`,
  analyze: `${BASE}/lead/analyze.svg`,
  generateImage: `${BASE}/lead/generate-image.svg`,
  research: `${BASE}/lead/research.svg`,
} as const;

export const SALES_ASSETS = {
  /** Rotating icon beside the sales mockup title (Framer `sales/inline-0.svg`). */
  titleIcon: `${BASE}/sales/inline-0.svg`,
} as const;

export const CUSTOM_ASSETS = {
  sliders: `${BASE}/custom/sliders.svg`,
  projectIcon: `${BASE}/custom/project-icon.svg`,
  progressRing: `${BASE}/custom/progress-ring.svg`,
  scheduleCalendar: `${BASE}/custom/schedule-calendar.svg`,
  meeting0: `${BASE}/custom/meeting-0.svg`,
  meeting1: `${BASE}/custom/meeting-1.svg`,
  meetingMenu: `${BASE}/custom/meeting-menu.svg`,
} as const;
