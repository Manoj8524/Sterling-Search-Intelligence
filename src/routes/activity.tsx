import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Optimization Activity | Sterling Search Intelligence" },
      { name: "description", content: "Recent SEO, AEO and GEO monitoring activity for Sterling Holidays." },
      { property: "og:title", content: "Optimization Activity | Sterling Search Intelligence" },
      { property: "og:description", content: "Track recent monitoring events and detected opportunities." },
    ],
  }),
  component: ActivityPage,
});
