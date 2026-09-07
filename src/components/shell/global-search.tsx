import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { resorts } from "@/data/resorts";
import { aiQueries, keywords, questions, recommendations, resortPages } from "@/data/content";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    const match = (s: string) => s.toLowerCase().includes(q);
    if (!q) {
      return {
        resorts: resorts.slice(0, 5),
        keywords: [],
        questions: [],
        aiQueries: [],
        pages: [],
        recommendations: recommendations.slice(0, 3),
      };
    }
    return {
      resorts: resorts.filter((r) => match(r.name) || match(r.city) || match(r.state)).slice(0, 5),
      keywords: keywords.filter((k) => match(k.keyword)).slice(0, 5),
      questions: questions.filter((x) => match(x.question)).slice(0, 5),
      aiQueries: aiQueries.filter((a) => match(a.query)).slice(0, 5),
      pages: resortPages.filter((p) => match(p.name) || match(p.path)).slice(0, 4),
      recommendations: recommendations.filter((r) => match(r.title)).slice(0, 4),
    };
  }, [q]);

  const go = (to: string, params?: Record<string, string>) => {
    onOpenChange(false);
    setQuery("");
    (navigate as unknown as (o: { to: string; params?: Record<string, string> }) => void)(
      params ? { to, params } : { to },
    );
  };

  const total =
    results.resorts.length +
    results.keywords.length +
    results.questions.length +
    results.aiQueries.length +
    results.pages.length +
    results.recommendations.length;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false} title="Global search"
      description="Search resorts, keywords, questions, AI queries, pages and recommendations">
      <CommandInput
        placeholder="Search resorts, keywords, questions, AI queries…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {total === 0 ? <CommandEmpty>No results found for “{query}”.</CommandEmpty> : null}

        {results.resorts.length > 0 && (
          <CommandGroup heading="Resorts">
            {results.resorts.map((r) => (
              <CommandItem key={r.id} value={r.id} onSelect={() => go("/resorts/$resortId", { resortId: r.id })}>
                <span>{r.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.city}, {r.state}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.keywords.length > 0 && (
          <CommandGroup heading="Keywords">
            {results.keywords.map((k) => (
              <CommandItem key={k.id} value={k.id} onSelect={() => go("/seo/keywords")}>
                <span>{k.keyword}</span>
                <span className="ml-auto text-xs text-muted-foreground">Pos {k.position}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.questions.length > 0 && (
          <CommandGroup heading="Questions">
            {results.questions.map((x) => (
              <CommandItem key={x.id} value={x.id} onSelect={() => go("/aeo/questions/$questionId", { questionId: x.id })}>
                <span className="truncate">{x.question}</span>
                <span className="ml-auto text-xs text-muted-foreground">{x.coverage}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.aiQueries.length > 0 && (
          <CommandGroup heading="AI Queries">
            {results.aiQueries.map((a) => (
              <CommandItem key={a.id} value={a.id} onSelect={() => go("/geo/ai-queries/$queryId", { queryId: a.id })}>
                <span className="truncate">{a.query}</span>
                <span className="ml-auto text-xs text-muted-foreground">{a.platform}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.pages.length > 0 && (
          <CommandGroup heading="Pages">
            {results.pages.map((p) => (
              <CommandItem key={p.id} value={p.id} onSelect={() => go("/pages/$pageId", { pageId: p.id })}>
                <span className="truncate">{p.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{p.path}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.recommendations.length > 0 && (
          <CommandGroup heading="Recommendations">
            {results.recommendations.map((r) => (
              <CommandItem
                key={r.id}
                value={r.id}
                onSelect={() => go("/recommendations/$recommendationId", { recommendationId: r.id })}
              >
                <span className="truncate">{r.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{r.priority}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
