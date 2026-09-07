import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Reports | Sterling Search Intelligence" },
      { name: "description", content: "Executive reports for Sterling Holidays search, answer and AI visibility." },
      { property: "og:title", content: "Reports | Sterling Search Intelligence" },
      { property: "og:description", content: "Download and review Sterling resort visibility reports." },
    ],
  }),
  component: ReportsPage,
});
