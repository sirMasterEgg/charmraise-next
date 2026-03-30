import {
  CustomMockup,
  LeadMockup,
  SalesMockup,
  WorkflowMockup,
} from "@/components/service-mockups";
import { SERVICES_CONTENT } from "@/content/services";

const SECTION_IDS = {
  crm: "workflow-automation",
  lead: "ai-assistant",
  sales: "sales-and-marketing",
  custom: "custom-projects",
} as const;

const GRAPHIC_FIRST = new Set<typeof SERVICES_CONTENT[number]["id"]>(["crm", "sales"]);

function ServiceBadge({ children }: { children: string }) {
  return (
    <div
      className="inline-flex w-min max-w-full items-center justify-center rounded-md border px-3 py-2"
      style={{
        borderColor: "rgb(34, 34, 34)",
        backgroundColor: "rgba(13, 13, 13, 0.8)",
      }}
    >
      <p className="whitespace-pre text-[14px] font-medium tracking-[-0.02em] leading-[1.2] text-white">
        {children}
      </p>
    </div>
  );
}

function ServiceGraphic({ id }: { id: (typeof SERVICES_CONTENT)[number]["id"] }) {
  switch (id) {
    case "crm":
      return <WorkflowMockup />;
    case "lead":
      return <LeadMockup />;
    case "sales":
      return <SalesMockup />;
    case "custom":
      return <CustomMockup />;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function Services() {
  return (
    <section
      id="services"
      data-section="services"
      className="flex w-full flex-col items-center gap-[60px] px-10 pt-[100px] pb-[120px]"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[60px]">
        <div className="flex w-full flex-col items-center gap-[25px] text-center">
          <ServiceBadge>Our Platform</ServiceBadge>
          <h2 className="text-[28px] font-normal leading-[1.1] tracking-[-0.04em] text-white min-[810px]:text-[40px] min-[1200px]:text-[50px]">
            Standardized solutions,
            <br />
            for real business problems.
          </h2>
          <p className="mx-auto max-w-2xl text-[16px] font-medium leading-[1.4] tracking-[-0.02em] text-[rgb(255,255,255,0.75)]">
            From automation to analytics, everything you need to optimize performance and grow smarter—powered by AI
          </p>
        </div>

        <div className="flex w-full max-w-[1000px] flex-col gap-[100px]">
          {SERVICES_CONTENT.map((service) => {
            const graphicFirst = GRAPHIC_FIRST.has(service.id);

            const graphic = (
              <div className="relative flex w-full min-h-[280px] shrink-0 flex-col overflow-hidden rounded-[18px] bg-[rgba(13,13,13,0.8)] pb-0 min-[810px]:h-[350px] min-[810px]:min-h-[350px] min-[810px]:max-h-[350px] min-[810px]:w-[45%] min-[810px]:max-w-[45%]">
                <div
                  data-service-graphic={service.id}
                  className="relative box-border flex h-full min-h-0 flex-1 flex-col overflow-hidden px-[50px] pt-[50px]"
                >
                  <ServiceGraphic id={service.id} />
                </div>
              </div>
            );

            const copy = (
              <div className="flex min-w-0 flex-1 flex-col items-start gap-5 min-[810px]:basis-0 min-[810px]:gap-5">
                <ServiceBadge>{service.category}</ServiceBadge>
                <div className="flex w-full flex-col gap-2.5">
                  <h3 className="text-[35px] font-medium leading-[1.1] tracking-[-0.04em] text-white">
                    {service.title}
                  </h3>
                  <p className="max-w-[450px] text-[16px] font-medium leading-[1.4] tracking-[-0.02em] text-[rgb(255,255,255,0.75)]">
                    {service.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {service.tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center justify-center rounded-md border px-3 py-2"
                      style={{
                        borderColor: "rgb(34, 34, 34)",
                        backgroundColor: "rgba(13, 13, 13, 0.8)",
                      }}
                    >
                      <span className="text-[14px] font-medium tracking-[-0.02em] leading-[1.2] text-white">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );

            return (
              <article
                key={service.id}
                id={SECTION_IDS[service.id]}
                data-framer-name={service.category}
                className={
                  graphicFirst
                    ? "flex w-full flex-col items-center gap-20 min-[810px]:flex-row min-[810px]:flex-wrap min-[810px]:justify-center min-[810px]:gap-20"
                    : "flex w-full flex-col-reverse items-center gap-20 min-[810px]:flex-row min-[810px]:flex-wrap min-[810px]:justify-center min-[810px]:gap-20"
                }
              >
                {graphicFirst ? (
                  <>
                    {graphic}
                    {copy}
                  </>
                ) : (
                  <>
                    {copy}
                    {graphic}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
