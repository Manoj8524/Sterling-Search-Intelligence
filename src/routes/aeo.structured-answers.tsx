import { createFileRoute } from "@tanstack/react-router";
import { AeoStructuredAnswersPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/aeo/structured-answers")({
  head: () => ({
    meta: [
      { title: "Structured Answers | Sterling Search Intelligence" },
      { name: "description", content: "Structured answer and how-to coverage for Sterling resort content." },
      { property: "og:title", content: "Structured Answers | Sterling Search Intelligence" },
      { property: "og:description", content: "Improve how Sterling content appears in answer engines." },
    ],
  }),
  component: AeoStructuredAnswersPage,
});
