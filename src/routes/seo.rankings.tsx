import { createFileRoute } from "@tanstack/react-router";
import { SeoRankingsPage } from "@/components/platform/missing-pages";

export const Route = createFileRoute("/seo/rankings")({
  head: () => ({
    meta: [
      { title: "Keyword Rankings | Sterling Search Intelligence" },
      { name: "description", content: "Sterling resort keyword rankings across traditional search." },
      { property: "og:title", content: "Keyword Rankings | Sterling Search Intelligence" },
      { property: "og:description", content: "Track organic keyword positions for Sterling Holidays resorts." },
    ],
  }),
  component: SeoRankingsPage,
});
