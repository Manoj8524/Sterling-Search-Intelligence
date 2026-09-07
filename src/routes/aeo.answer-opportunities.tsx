import { createFileRoute } from "@tanstack/react-router";
import { AeoAnswerOpportunitiesPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/aeo/answer-opportunities")({
  head: () => ({
    meta: [
      { title: "Answer Opportunities | Sterling Search Intelligence" },
      { name: "description", content: "Prioritised answer-engine opportunities for Sterling Holidays resorts." },
      { property: "og:title", content: "Answer Opportunities | Sterling Search Intelligence" },
      { property: "og:description", content: "Find high-impact AEO opportunities across Sterling resort content." },
    ],
  }),
  component: AeoAnswerOpportunitiesPage,
});
