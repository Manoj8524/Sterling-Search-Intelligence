import { createFileRoute } from "@tanstack/react-router";
import { RecommendationsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/recommendations/")({
  head: () => ({
    meta: [
      { title: "Recommendations | Sterling Search Intelligence" },
      { name: "description", content: "Unified SEO, AEO and GEO recommendations for Sterling Holidays resorts." },
      { property: "og:title", content: "Recommendations | Sterling Search Intelligence" },
      { property: "og:description", content: "Prioritised cross-layer actions for Sterling resort visibility." },
    ],
  }),
  component: RecommendationsPage,
});
