import { createFileRoute } from "@tanstack/react-router";
import { GeoOverviewPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/")({
  head: () => ({
    meta: [
      { title: "GEO Overview | Sterling Search Intelligence" },
      { name: "description", content: "Generative engine optimisation overview for Sterling Holidays resorts." },
      { property: "og:title", content: "GEO Overview | Sterling Search Intelligence" },
      { property: "og:description", content: "Monitor AI visibility, mentions and citations for Sterling resorts." },
    ],
  }),
  component: GeoOverviewPage,
});
