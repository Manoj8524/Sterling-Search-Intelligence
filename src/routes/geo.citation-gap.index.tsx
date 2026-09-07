import { createFileRoute } from "@tanstack/react-router";
import { GeoCitationGapPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/geo/citation-gap/")({
  head: () => ({
    meta: [
      { title: "Citation Gap | Sterling Search Intelligence" },
      { name: "description", content: "Citation gap analysis for Sterling Holidays resort content." },
      { property: "og:title", content: "Citation Gap | Sterling Search Intelligence" },
      { property: "og:description", content: "Find where competitors are cited by AI instead of Sterling." },
    ],
  }),
  component: GeoCitationGapPage,
});
