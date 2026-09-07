import { createFileRoute } from "@tanstack/react-router";
import { GeoAiMentionsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/ai-mentions")({
  head: () => ({
    meta: [
      { title: "AI Mentions | Sterling Search Intelligence" },
      { name: "description", content: "Track where Sterling resorts are mentioned inside AI-generated responses." },
      { property: "og:title", content: "AI Mentions | Sterling Search Intelligence" },
      { property: "og:description", content: "Monitor brand mentions and citations in generative AI answers." },
    ],
  }),
  component: GeoAiMentionsPage,
});
