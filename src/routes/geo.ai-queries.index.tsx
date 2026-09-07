import { createFileRoute } from "@tanstack/react-router";
import { GeoAiQueriesPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/ai-queries/")({
  head: () => ({
    meta: [
      { title: "AI Queries | Sterling Search Intelligence" },
      { name: "description", content: "Traveller queries monitored across generative AI platforms for Sterling resorts." },
      { property: "og:title", content: "AI Queries | Sterling Search Intelligence" },
      { property: "og:description", content: "Explore AI queries that mention or should mention Sterling resorts." },
    ],
  }),
  component: GeoAiQueriesPage,
});
