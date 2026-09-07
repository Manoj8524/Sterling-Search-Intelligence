import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Sterling Search Intelligence" },
      { name: "description", content: "Configure the Sterling Search Intelligence demo workspace." },
      { property: "og:title", content: "Settings | Sterling Search Intelligence" },
      { property: "og:description", content: "Workspace preferences and demo data settings." },
    ],
  }),
  component: SettingsPage,
});
