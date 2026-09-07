import { createFileRoute } from "@tanstack/react-router";
import { AeoFaqCoveragePage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/aeo/faq-coverage")({
  head: () => ({
    meta: [
      { title: "FAQ Coverage | Sterling Search Intelligence" },
      { name: "description", content: "FAQ cluster coverage across Sterling resort pages." },
      { property: "og:title", content: "FAQ Coverage | Sterling Search Intelligence" },
      { property: "og:description", content: "Track FAQ and structured answer coverage for Sterling resorts." },
    ],
  }),
  component: AeoFaqCoveragePage,
});
