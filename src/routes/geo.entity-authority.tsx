import { createFileRoute } from "@tanstack/react-router";
import { GeoEntityAuthorityPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/entity-authority")({
  head: () => ({
    meta: [
      { title: "Entity Authority | Sterling Search Intelligence" },
      { name: "description", content: "Entity authority scores for Sterling Holidays resorts across AI platforms." },
      { property: "og:title", content: "Entity Authority | Sterling Search Intelligence" },
      { property: "og:description", content: "How well AI systems recognise Sterling resorts as authoritative entities." },
    ],
  }),
  component: GeoEntityAuthorityPage,
});
