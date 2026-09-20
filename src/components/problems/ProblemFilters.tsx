"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { difficultyLabel, progressLabel } from "./problem-ui";

type TopicOption = { id: string; slug: string; name: string; moduleName: string };
type SortOption = { value: string; label: string };

/**
 * ProblemFilters — live filter bar. Changes apply immediately: selects push
 * on change, the search box debounces at ~350ms. All state lives in the URL
 * (the server page remains the source of truth), so back/forward and shared
 * links behave exactly as before.
 */
export function ProblemFilters({
  topics,
  sortOptions,
  statusOptions,
  signedIn,
  query,
  difficulty,
  topicSlug,
  status,
  sort,
}: {
  topics: TopicOption[];
  sortOptions: SortOption[];
  statusOptions: readonly string[];
  signedIn: boolean;
  query: string;
  difficulty: string;
  topicSlug: string;
  status: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(query);

  // Keep the input honest when the URL changes behind us (clear-filters link,
  // browser back). Adjusting during render is the sanctioned pattern — no
  // cascading effect renders.
  const [lastUrlQuery, setLastUrlQuery] = useState(query);
  if (query !== lastUrlQuery) {
    setLastUrlQuery(query);
    setSearchText(query);
  }

  const apply = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string> = {
      q: query,
      difficulty,
      topic: topicSlug,
      status,
      sort,
      ...Object.fromEntries(
        Object.entries(overrides)
          .filter(([, value]) => value !== null && value !== "")
          .map(([key, value]) => [key, value as string]),
      ),
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    if (params.get("sort") === sortOptions[0]?.value) params.delete("sort");

    startTransition(() => {
      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
    });
  };

  // Debounced search — wait for a typing pause before hitting the URL.
  useEffect(() => {
    if (searchText === query) return;
    const timeout = setTimeout(() => {
      apply({ q: searchText });
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters =
    Boolean(query) || Boolean(difficulty) || Boolean(topicSlug) || (signedIn && Boolean(status));

  const activeCount =
    (difficulty ? 1 : 0) + (topicSlug ? 1 : 0) + (signedIn && status ? 1 : 0);

  const selectClasses = "field text-sm";

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="space-y-4"
      role="search"
    >
      <div className="flex items-stretch gap-2 md:hidden">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search problems</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search…"
              className="field field-pad-left field-pad-right text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite">
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.5} />
              ) : null}
            </span>
          </div>
        </label>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className={cn(
            "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
            activeCount > 0 || filtersOpen
              ? "border-ink-blue/40 bg-ink-blue-wash text-ink-blue"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border-hover",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink-blue px-1 text-xs font-semibold text-white tabular-nums">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div
        className={cn(
          "grid gap-4 md:grid-cols-2 xl:grid-cols-5",
          filtersOpen ? "grid" : "hidden md:grid",
        )}
      >
      <label className="hidden space-y-1.5 md:block xl:col-span-2">
        <span className="block text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
          Search
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search title, statement, topic…"
            className="field field-pad-left field-pad-right text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite">
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.5} />
            ) : null}
          </span>
        </div>
      </label>

      <label className="space-y-1.5">
        <span className="block text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
          Difficulty
        </span>
        <select
          value={difficulty}
          onChange={(event) => apply({ difficulty: event.target.value })}
          className={selectClasses}
        >
          <option value="">All levels</option>
          {(["EASY", "MEDIUM", "HARD"] as const).map((value) => (
            <option key={value} value={value}>
              {difficultyLabel[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="block text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
          Topic
        </span>
        <select
          value={topicSlug}
          onChange={(event) => apply({ topic: event.target.value })}
          className={selectClasses}
        >
          <option value="">All topics</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.slug}>
              {topic.moduleName} · {topic.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-1.5">
        <span className="block text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
          Status &amp; sort
        </span>
        <div className="flex gap-2">
          <select
            value={signedIn ? status : ""}
            disabled={!signedIn}
            onChange={(event) => apply({ status: event.target.value })}
            className={`min-w-0 flex-1 ${selectClasses} disabled:opacity-60`}
            aria-label="Filter by problem status"
            title={signedIn ? undefined : "Sign in to filter by saved status"}
          >
            <option value="">Any status</option>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {progressLabel[value as keyof typeof progressLabel]}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => apply({ sort: event.target.value })}
            className={`min-w-0 flex-1 ${selectClasses}`}
            aria-label="Sort problems by"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {!signedIn && (
          <span className="block text-xs text-muted-foreground">
            Sign in to filter by saved status.
          </span>
        )}
      </div>
      </div>

      {hasActiveFilters && (
        <div className="flex md:justify-end">
          <button
            type="button"
            onClick={() => {
              setSearchText("");
              apply({ q: null, difficulty: null, topic: null, status: null });
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-ink-red transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            Clear all filters
          </button>
        </div>
      )}
    </form>
  );
}
