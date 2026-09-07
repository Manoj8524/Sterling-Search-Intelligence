import { createFileRoute } from "@tanstack/react-router";
import { SeoIssuesPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/seo/issues/")({
  head: () => ({
    meta: [
      { title: "SEO Issues | Sterling Search Intelligence" },
      { name: "description", content: "Technical and on-page SEO issues across Sterling resort pages." },
      { property: "og:title", content: "SEO Issues | Sterling Search Intelligence" },
      { property: "og:description", content: "Issue register and recommended fixes for Sterling resort SEO." },
    ],
  }),
  component: SeoIssuesPage,
});
