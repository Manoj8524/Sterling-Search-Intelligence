import { createFileRoute } from "@tanstack/react-router";
import { GeoAiVisibilityPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/ai-visibility")({
  head: () => ({
    meta: [
      { title: "AI Visibility | Sterling Search Intelligence" },
      { name: "description", content: "Sterling resort visibility inside generative AI and answer platforms." },
      { property: "og:title", content: "AI Visibility | Sterling Search Intelligence" },
      { property: "og:description", content: "Compare Sterling AI visibility against competitor benchmarks." },
    ],
  }),
  component: GeoAiVisibilityPage,
});
