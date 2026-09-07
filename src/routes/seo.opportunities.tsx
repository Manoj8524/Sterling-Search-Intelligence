import { createFileRoute } from "@tanstack/react-router";
import { SeoOpportunitiesPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/seo/opportunities")({
  head: () => ({
    meta: [
      { title: "SEO Opportunities | Sterling Search Intelligence" },
      { name: "description", content: "Prioritised SEO opportunities for Sterling Holidays resort content." },
      { property: "og:title", content: "SEO Opportunities | Sterling Search Intelligence" },
      { property: "og:description", content: "Find the highest-impact organic search opportunities for Sterling resorts." },
    ],
  }),
  component: SeoOpportunitiesPage,
});
