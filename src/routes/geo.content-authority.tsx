import { createFileRoute } from "@tanstack/react-router";
import { GeoContentAuthorityPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/content-authority")({
  head: () => ({
    meta: [
      { title: "Content Authority | Sterling Search Intelligence" },
      { name: "description", content: "Content authority scores for Sterling Holidays resort destination content." },
      { property: "og:title", content: "Content Authority | Sterling Search Intelligence" },
      { property: "og:description", content: "Measure citable, trustworthy destination content for generative AI." },
    ],
  }),
  component: GeoContentAuthorityPage,
});
