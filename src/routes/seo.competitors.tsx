import { createFileRoute } from "@tanstack/react-router";
import { SeoCompetitorsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/seo/competitors")({
  head: () => ({
    meta: [
      { title: "Competitor Intelligence | Sterling Search Intelligence" },
      { name: "description", content: "Compare Sterling resort visibility against Club Mahindra, Taj, Airbnb and other competitors." },
      { property: "og:title", content: "Competitor Intelligence | Sterling Search Intelligence" },
      { property: "og:description", content: "SERP and content comparison for Sterling resort keywords." },
    ],
  }),
  component: SeoCompetitorsPage,
});
