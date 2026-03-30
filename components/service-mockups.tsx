"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WorkflowIconKey } from "@/content/service-graphics";
import {
  CUSTOM_PROJECT,
  LEAD_AVATAR_DATA_URL,
  LEAD_CHAT,
  LEAD_TYPING_REDUCED_MOTION,
  LEAD_TYPING_PHRASES,
  SALES_EMAIL,
  SALES_LEADS,
  WORKFLOW_TOP,
  WORKFLOW_TASKS,
} from "@/content/service-graphics";
import { HeroCentralOrb, HERO_ORB_CONTAINER_PX } from "@/components/hero-central-orb";
import { CUSTOM_ASSETS, LEAD_ASSETS, SALES_ASSETS, workflowIconSrc } from "@/content/framer-service-assets";

const BORDER = "rgb(34, 34, 34)";
const ACCENT = "rgb(129, 74, 200)";

/** Framer `graphics` nodes use these masks (see live computed styles on reference). */
const MASK_GRAPHICS_FADE_BOTTOM =
  "linear-gradient(rgb(0, 0, 0) 26%, rgba(0, 0, 0, 0) 100%)";
const MASK_GRAPHICS_FADE_CUSTOM =
  "linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 74%)";
/** Framer sales slideshow: vertical stack with soft fade at top/bottom (partial cards visible). */
const MASK_SALES_SLIDESHOW =
  "linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 22%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 100%)";

function WorkflowLeftIconSlot({ iconKey }: { iconKey: WorkflowIconKey }) {
  return (
    <div
      className="flex size-[28px] shrink-0 items-center justify-center rounded-[4px] p-[5px]"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <Image
        src={workflowIconSrc(iconKey)}
        alt=""
        width={18}
        height={18}
        unoptimized
        className="size-[18px] shrink-0"
      />
    </div>
  );
}

function WorkflowRightIconSlot({ iconKey }: { iconKey: WorkflowIconKey }) {
  return (
    <div
      className="flex size-[18px] shrink-0 items-center justify-center rounded-[4px] p-px"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <Image
        src={workflowIconSrc(iconKey)}
        alt=""
        width={16}
        height={16}
        unoptimized
        className="size-4 shrink-0"
      />
    </div>
  );
}

function WorkflowTaskRow({
  title,
  status,
  left,
  right,
}: {
  title: string;
  status: string;
  left: WorkflowIconKey;
  right: WorkflowIconKey;
}) {
  return (
    <div className="flex w-full shrink-0 items-center gap-[10px] p-[5px]">
      <div className="flex min-w-0 flex-[1_0_0] items-center gap-[7px]">
        <WorkflowLeftIconSlot iconKey={left} />
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <p className="text-[12px] font-medium leading-[12px] tracking-[-0.02em] text-white">
            {title}
          </p>
          <p
            className="text-[10px] font-normal leading-[11px] tracking-[-0.02em]"
            style={{ color: "rgba(255, 255, 255, 0.9)" }}
          >
            {status}
          </p>
        </div>
      </div>
      <WorkflowRightIconSlot iconKey={right} />
    </div>
  );
}

export function WorkflowMockup() {
  const loop = [...WORKFLOW_TASKS, ...WORKFLOW_TASKS];
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-t-[12px] bg-black">
      <div className="flex min-h-0 flex-1 flex-col gap-[10px] p-[10px]">
        <div
          className="flex shrink-0 flex-row items-center justify-center gap-[5px] rounded-[3px] p-[3px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <div
            className="flex flex-1 items-center justify-center rounded-[2px] p-[3px]"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <p className="text-center text-[12px] font-medium leading-[12px] tracking-[-0.02em] text-white">
              {WORKFLOW_TOP.allTasks}
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-[2px] p-[5px]">
            <p className="text-center text-[12px] font-medium leading-[12px] tracking-[-0.02em] text-white">
              {WORKFLOW_TOP.waiting}
            </p>
          </div>
        </div>
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{
            maskImage: MASK_GRAPHICS_FADE_BOTTOM,
            WebkitMaskImage: MASK_GRAPHICS_FADE_BOTTOM,
          }}
        >
          <div className="animate-marquee-y flex flex-col gap-[10px]">
            {loop.map((task, i) => (
              <WorkflowTaskRow
                key={`${task.title}-${i}`}
                title={task.title}
                status={task.status}
                left={task.left}
                right={task.right}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const LEAD_ACTION_SRC = {
  analyze: LEAD_ASSETS.analyze,
  generate: LEAD_ASSETS.generateImage,
  research: LEAD_ASSETS.research,
} as const;

function LeadTypingLine({ phrases }: { phrases: readonly string[] }) {
  const reduced = useReducedMotion() === true;
  const [text, setText] = useState(() =>
    reduced ? LEAD_TYPING_REDUCED_MOTION : "",
  );
  const phraseIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const phaseRef = useRef<"type" | "hold" | "delete">("type");

  useEffect(() => {
    if (reduced) {
      setText(LEAD_TYPING_REDUCED_MOTION);
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = (ms: number, fn: () => void) => {
      timeoutId = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;
      const phrase = phrases[phraseIndexRef.current % phrases.length];
      if (phaseRef.current === "type") {
        if (charIndexRef.current < phrase.length) {
          charIndexRef.current++;
          setText(phrase.slice(0, charIndexRef.current));
          schedule(45 + Math.floor(Math.random() * 35), tick);
        } else {
          phaseRef.current = "hold";
          schedule(1800, tick);
        }
      } else if (phaseRef.current === "hold") {
        phaseRef.current = "delete";
        schedule(0, tick);
      } else if (charIndexRef.current > 0) {
        charIndexRef.current--;
        setText(phrase.slice(0, charIndexRef.current));
        schedule(32, tick);
      } else {
        phraseIndexRef.current++;
        phaseRef.current = "type";
        schedule(450, tick);
      }
    };

    phraseIndexRef.current = 0;
    charIndexRef.current = 0;
    phaseRef.current = "type";
    setText("");
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reduced, phrases]);

  return (
    <>
      {text}
      {reduced ? null : (
        <span
          className="ml-px inline-block h-3 w-px animate-cursor-blink align-middle"
          style={{ backgroundColor: ACCENT }}
          aria-hidden
        />
      )}
    </>
  );
}

export function LeadMockup() {
  const c = LEAD_CHAT;
  return (
    <div
      className="flex h-full w-full flex-col items-center overflow-x-hidden rounded-t-[12px] bg-black"
      style={{
        maskImage: MASK_GRAPHICS_FADE_BOTTOM,
        WebkitMaskImage: MASK_GRAPHICS_FADE_BOTTOM,
      }}
    >
      <div className="flex w-full flex-col items-center gap-[15px] px-[10px] pb-[10px] pt-[44px]">
        <HeroCentralOrb
          scale={58 / HERO_ORB_CONTAINER_PX}
          blurPx={1}
          layerOpacity={1}
          className="mx-auto shrink-0"
        />
        <p className="text-center text-[16px] font-medium leading-[22.4px] tracking-[-0.32px] text-white">
          {c.title}
        </p>
        <p
          className="max-w-[280px] text-center text-[10px] font-normal leading-[11px] tracking-[-0.4px]"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          {c.body}
        </p>
        <div className="w-full rounded-[4px] px-[10px] pb-[5px] pt-[10px]">
          <div
            className="text-left text-[12px] font-medium leading-[13.2px] tracking-[-0.02em]"
            style={{ color: "rgba(255, 255, 255, 0.75)" }}
          >
            <LeadTypingLine phrases={LEAD_TYPING_PHRASES} />
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[8px] py-[3px] pl-[5px] pr-[8px] text-[10px] font-normal text-white/90"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <Image
                src={LEAD_ASSETS.addDocument}
                alt=""
                width={12}
                height={12}
                unoptimized
                className="size-3 shrink-0"
              />
              {c.addDocument}
            </button>
            <Image
              src={LEAD_ASSETS.send}
              alt=""
              width={12}
              height={12}
              unoptimized
              className="size-3 shrink-0"
            />
          </div>
        </div>
        <div className="flex w-full flex-wrap justify-center gap-2">
          {c.actions.map((a) => {
            const src = LEAD_ACTION_SRC[a.id as keyof typeof LEAD_ACTION_SRC];
            return (
              <button
                key={a.id}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-[8px] py-[3px] pl-[5px] pr-[8px] text-[10px] font-normal text-white/90"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <Image
                  src={src}
                  alt=""
                  width={12}
                  height={12}
                  unoptimized
                  className="size-3 shrink-0"
                />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SalesLeadCard({ lead }: { lead: (typeof SALES_LEADS)[number] }) {
  return (
    <div
      data-sales-card
      className="w-full shrink-0 rounded-lg border p-3"
      style={{ borderColor: BORDER, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
    >
      <div className="mb-2 flex items-start gap-2">
        <div
          className="relative size-9 overflow-hidden rounded-full border"
          style={{ borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Image
            src={LEAD_AVATAR_DATA_URL}
            alt=""
            fill
            unoptimized
            className="object-cover p-1.5"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-white">{lead.name}</p>
          <p className="text-[9px] text-white/55">{lead.role}</p>
          <p className="text-[8px] font-medium text-emerald-400/90">Verified</p>
        </div>
      </div>
      <div className="space-y-1 border-t border-white/10 pt-2 text-[9px] text-white/70">
        <div className="flex justify-between gap-1">
          <span className="text-white/45">E-mail</span>
          <span className="truncate text-right">{lead.email}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="text-white/45">Company</span>
          <span className="truncate text-right">{lead.company}</span>
        </div>
      </div>
    </div>
  );
}

/** Vertical stack step + Framer-style cadence (hold per card). */
const SALES_SLIDE_INTERVAL_MS = 2000;
const SALES_STATUS_INTERVAL_MS = 2000;
const SALES_CARD_GAP_PX = 5;

export function SalesMockup() {
  const reduced = useReducedMotion() === true;
  const colRef = useRef<HTMLDivElement>(null);
  const [slideStepPx, setSlideStepPx] = useState(100);
  const [slideIndex, setSlideIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useLayoutEffect(() => {
    const root = colRef.current;
    if (!root) return;
    const measure = () => {
      const card = root.querySelector("[data-sales-card]");
      if (!card) return;
      const h = card.getBoundingClientRect().height;
      setSlideStepPx(h + SALES_CARD_GAP_PX);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const card = root.querySelector("[data-sales-card]");
    if (card) ro.observe(card);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) {
      setSlideIndex(0);
      setStatusIndex(0);
      return;
    }
    const tSlide = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % SALES_LEADS.length);
    }, SALES_SLIDE_INTERVAL_MS);
    const tStatus = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % SALES_EMAIL.statusTabs.length);
    }, SALES_STATUS_INTERVAL_MS);
    return () => {
      clearInterval(tSlide);
      clearInterval(tStatus);
    };
  }, [reduced]);

  const offsetY = reduced ? 0 : -slideIndex * slideStepPx;

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-t-[12px] border pb-3 pt-[11px]"
      style={{ borderColor: BORDER, backgroundColor: "#000" }}
    >
      {/*
        Framer: single bordered row (input-like), title left + spinner right; tags tight underneath,
        outline-only pills. Taller centered header was pushing the slideshow down in pixel diffs.
      */}
      <div className="mx-auto w-full max-w-[330px] shrink-0 space-y-2">
        <div
          data-probe="sales-email-bar"
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-[7px]"
          style={{ borderColor: BORDER }}
        >
          <p className="min-w-0 flex-1 text-left text-[12px] font-medium tracking-[-0.02em] text-white">
            {SALES_EMAIL.title}
          </p>
          <span
            data-probe="sales-title-icon"
            className={
              reduced
                ? "inline-flex size-[18px] shrink-0"
                : "inline-flex size-[18px] shrink-0 animate-sales-title-icon"
            }
          >
            <Image
              src={SALES_ASSETS.titleIcon}
              alt=""
              width={18}
              height={18}
              unoptimized
              className="size-[18px] shrink-0"
            />
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SALES_EMAIL.filters.map((f) => (
            <span
              key={f}
              className="rounded-md border px-2 py-0.5 text-[10px] font-medium text-white/85"
              style={{ borderColor: BORDER, backgroundColor: "transparent" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex w-full max-w-[330px] flex-col gap-3 self-center">
        <div
          data-probe="sales-slideshow"
          className="relative h-[164px] min-h-[164px] w-full shrink-0 overflow-hidden"
          style={{
            maskImage: MASK_SALES_SLIDESHOW,
            WebkitMaskImage: MASK_SALES_SLIDESHOW,
          }}
        >
          {reduced ? (
            <div className="flex h-full items-center justify-center px-0.5">
              <SalesLeadCard lead={SALES_LEADS[0]} />
            </div>
          ) : (
            <div
              ref={colRef}
              className="flex flex-col gap-[5px] will-change-transform"
              style={{
                transform: `translateY(${offsetY}px)`,
                transition: reduced ? "none" : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {SALES_LEADS.map((lead) => (
                <SalesLeadCard key={lead.email} lead={lead} />
              ))}
            </div>
          )}
        </div>
        <div
          data-probe="sales-status"
          className="flex min-h-[52px] shrink-0 flex-col justify-center px-1 pt-0.5"
          aria-label="Send progress"
        >
          <div className="flex w-full items-center justify-center">
            {SALES_EMAIL.statusTabs.map((t, i) => (
              <div key={t} className="flex items-center">
                {i > 0 && (
                  <div
                    className="h-px w-9 min-w-[2rem] max-w-[3.5rem] sm:w-12"
                    style={{
                      backgroundColor:
                        statusIndex >= i ? ACCENT : "rgba(255, 255, 255, 0.12)",
                      transition: reduced
                        ? "none"
                        : "background-color 0.52s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    aria-hidden
                  />
                )}
                <div className="flex flex-col items-center gap-1.5 px-1">
                  <div
                    className="size-2 shrink-0 rounded-full border"
                    style={{
                      borderColor: statusIndex >= i ? ACCENT : "rgba(255, 255, 255, 0.28)",
                      backgroundColor: statusIndex >= i ? ACCENT : "#000",
                      transition: reduced
                        ? "none"
                        : "border-color 0.52s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.52s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    aria-hidden
                  />
                  <span
                    className={`text-[10px] font-medium leading-none ${
                      statusIndex === i ? "text-white" : "text-white/45"
                    }`}
                  >
                    {t}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Framer cycles weekday highlight on a multi-second beat (not every 2s). */
const CUSTOM_DAY_CYCLE_MS = 3200;

export function CustomMockup() {
  const p = CUSTOM_PROJECT;
  const reduced = useReducedMotion() === true;
  const [activeDayIndex, setActiveDayIndex] = useState<number>(p.activeDayIndex);
  const meetingsForDay = p.scheduleByDay[activeDayIndex] ?? [];

  useEffect(() => {
    if (reduced) {
      setActiveDayIndex(p.activeDayIndex);
      return;
    }
    const id = setInterval(() => {
      setActiveDayIndex((i) => (i + 1) % p.days.length);
    }, CUSTOM_DAY_CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced, p.activeDayIndex, p.days.length]);

  return (
    <div
      className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-t-[12px] bg-black pb-[10px] pt-[32px]"
      style={{
        maskImage: MASK_GRAPHICS_FADE_CUSTOM,
        WebkitMaskImage: MASK_GRAPHICS_FADE_CUSTOM,
      }}
    >
      <div className="flex flex-col gap-[5px]">
        <p className="text-[12px] font-medium leading-[12px] text-white">{p.greeting}</p>
        <p
          className="text-[10px] leading-[11px]"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          {p.subtitle}
        </p>
      </div>
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium leading-[12px] text-white">
          <Image
            src={CUSTOM_ASSETS.sliders}
            alt=""
            width={14}
            height={14}
            unoptimized
            className="size-3.5 shrink-0"
          />
          {p.ongoingLabel}
        </p>
        <div
          className="flex items-center gap-3 rounded-lg p-3"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <Image
              src={CUSTOM_ASSETS.projectIcon}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="size-5 shrink-0"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium leading-[12px] text-white">{p.projectTitle}</p>
            <p className="text-[10px] leading-[11px] text-white/55">{p.progressLabel}</p>
          </div>
          <Image
            src={CUSTOM_ASSETS.progressRing}
            alt=""
            width={16}
            height={16}
            unoptimized
            className="size-4 shrink-0"
          />
        </div>
      </div>
      <div className="mt-2">
        <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium leading-[12px] text-white">
          <Image
            src={CUSTOM_ASSETS.scheduleCalendar}
            alt=""
            width={14}
            height={14}
            unoptimized
            className="size-3.5 shrink-0"
          />
          {p.scheduleTitle}
        </p>
        <div
          data-probe="custom-weekly-days"
          className="mb-3 flex max-w-[290px] flex-wrap justify-start gap-[7px] ml-[30px]"
        >
          {p.days.map((d, i) => (
            <span
              key={d}
              className="rounded-[3px] text-[10px] font-normal leading-[11px]"
              style={{
                color: i === activeDayIndex ? "#fff" : "rgba(255,255,255,0.35)",
                backgroundColor: i === activeDayIndex ? ACCENT : "transparent",
                padding: "2px 4px",
              }}
            >
              {d}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            data-probe="custom-meetings"
            key={activeDayIndex}
            className="w-full max-w-[300px] space-y-2 ml-[25px]"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {meetingsForDay.length === 0 ? (
              <p className="py-3 text-[10px] font-normal leading-[14px] text-white/35">
                No meeting today.
              </p>
            ) : (
              meetingsForDay.map((m, row) => (
                <div
                  key={`${activeDayIndex}-${row}-${m.title}`}
                  className="flex items-center gap-2 rounded-md px-2 py-2"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                >
                  <Image
                    src={row % 2 === 0 ? CUSTOM_ASSETS.meeting0 : CUSTOM_ASSETS.meeting1}
                    alt=""
                    width={12}
                    height={12}
                    unoptimized
                    className="size-3 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-normal text-white">{m.title}</p>
                    <p className="text-[8px] font-normal leading-[11px] text-white/55">{m.time}</p>
                  </div>
                  <Image
                    src={CUSTOM_ASSETS.meetingMenu}
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="size-4 shrink-0"
                  />
                </div>
              ))
            )}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
