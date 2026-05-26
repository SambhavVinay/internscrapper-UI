"use client";

import { useState, useCallback, useEffect } from "react";
import SearchForm from "./SearchForm";
import type { SearchFilters } from "./SearchForm";
import JobCard from "./JobCard";
import StatusBanner from "./StatusBanner";
import SchoolFilter from "./SchoolFilter";
import type { SchoolsData } from "./SchoolFilter";
import ThemeToggle from "./ThemeToggle";
import AcademicNotice from "./AcademicNotice";
import Footer from "./Footer";

const API_BASE = "https://sambhavvvvv-oppurtunityhub.hf.space";

export interface Job {
  title: string | null;
  company: string | null;
  location: string | null;
  link: string | null;
  posted: string | null;
  posted_datetime: string | null;
  programs: string[];
  schools: string[];
}

type ScrapeStatus = "idle" | "loading" | "success" | "error";

export default function InternshipDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<ScrapeStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [lastQuery, setLastQuery] = useState({ keywords: "", location: "" });
  const [elapsed, setElapsed] = useState(0);
  const [engine, setEngine] = useState("");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [totalSearches, setTotalSearches] = useState(0);
  const [deduplicatedCount, setDeduplicatedCount] = useState(0);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  const [schools, setSchools] = useState<SchoolsData>({});
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  // Fetch school registry once on mount — used for the filter chips.
  useEffect(() => {
    fetch(`${API_BASE}/schools`)
      .then((r) => r.json())
      .then(setSchools)
      .catch(() => { });
  }, []);

  // Per-school job counts (computed from full unfiltered list).
  const counts: Record<string, number> = {};
  for (const code of Object.keys(schools)) {
    counts[code] = jobs.filter((j) => j.schools.includes(code)).length;
  }

  const filteredJobs = selectedSchool
    ? jobs.filter((j) => j.schools.includes(selectedSchool))
    : jobs;

  const processStream = useCallback(async (res: Response, startTime: number) => {
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Failed to initialize stream reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let hasJobs = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const chunk = JSON.parse(trimmed);
          if (chunk.type === "start") {
            setEngine(chunk.engine || "");
            if (chunk.total_searches) {
              setTotalSearches(chunk.total_searches);
              setStatusMessages([`Checking ${chunk.total_searches} sources simultaneously`]);
            }
          } else if (chunk.type === "info") {
            console.log("Search info:", chunk.message);
            setStatusMessages((prev) => {
              const updated = [...prev, chunk.message];
              return updated.slice(-3);
            });
          } else if (chunk.type === "jobs") {
            if (chunk.data && chunk.data.length > 0) {
              hasJobs = true;
              setJobs((prev) => {
                const combined = [...prev, ...chunk.data];
                const seen = new Set();
                return combined.filter((job) => {
                  if (!job.link) return true;
                  if (seen.has(job.link)) return false;
                  seen.add(job.link);
                  return true;
                });
              });
              if (chunk.deduplicated) {
                setDeduplicatedCount((prev) => prev + chunk.deduplicated);
              }
              setTotal((prev) => prev + chunk.data.length);
              if (chunk.engine) {
                setEngine(chunk.engine);
              }
            }
          } else if (chunk.type === "done") {
            setEngine(chunk.engine || "");
            if (chunk.url) setScrapeUrl(chunk.url);
            setTotal(chunk.total || 0);
            setElapsed(Math.round((Date.now() - startTime) / 1000));
            if (chunk.partial && hasJobs) {
              setErrorMsg(`Found opportunities but the search was interrupted: ${chunk.error || "connection lost"}`);
            }
            setStatus("success");
          } else if (chunk.type === "error") {
            if (hasJobs) {
              setErrorMsg(`Found opportunities before the search ended: ${chunk.message || "Search failed"}`);
              setStatus("success");
            } else {
              throw new Error(chunk.message || "Search failed");
            }
          }
        } catch (e) {
          console.error("Failed to parse stream line:", e);
        }
      }
    }

    setStatus((prev) => (prev === "loading" ? "success" : prev));
    setElapsed(Math.round((Date.now() - startTime) / 1000));
  }, []);

  const handleScrape = useCallback(async (filters: SearchFilters) => {
    setStatus("loading");
    setErrorMsg("");
    setJobs([]);
    setTotal(0);
    setEngine("");
    setScrapeUrl("");
    setSelectedSchool(null);
    setTotalSearches(0);
    setDeduplicatedCount(0);
    setStatusMessages([]);

    setLastQuery({ keywords: filters.keywords, location: "Bengaluru metro" });

    const startTime = Date.now();

    try {
      const params = new URLSearchParams({
        keywords: filters.keywords,
        freshness: filters.freshness,
      });
      for (const wt of filters.work_types) params.append("work_types", wt);
      for (const jt of filters.job_types) params.append("job_types", jt);

      const res = await fetch(
        `${API_BASE}/scrape-internships?${params.toString()}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server responded with ${res.status}`);
      }

      await processStream(res, startTime);
    } catch (err: unknown) {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setStatus("error");
    }
  }, [processStream]);

  const reconnectToStream = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    setJobs([]);
    setTotal(0);
    setEngine("");
    setSelectedSchool(null);
    setTotalSearches(0);
    setDeduplicatedCount(0);
    setStatusMessages(["Reconnecting to active search..."]);
    
    const startTime = Date.now();
    try {
      const res = await fetch(`${API_BASE}/scrape-internships/stream`);
      if (!res.ok) throw new Error("Failed to reconnect");
      await processStream(res, startTime);
    } catch (err) {
      console.error("Reconnect failed", err);
      setStatus("idle");
    }
  }, [processStream]);

  useEffect(() => {
    fetch(`${API_BASE}/scrape-internships/status`)
      .then(res => res.json())
      .then(data => {
        if (data.is_active || data.has_history) {
          reconnectToStream();
        }
      })
      .catch(e => console.error("Failed to check scrape status", e));
  }, [reconnectToStream]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* ── Header ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "var(--header-bg)",
          borderBottom: "2px solid var(--card-border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black"
              style={{
                background: "var(--accent)",
                color: "#ffffff",
                border: "2px solid var(--card-border)",
                boxShadow: "2px 2px 0 var(--shadow-color)",
              }}
            >
              OH
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                OpportunityHub
              </h1>
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Student Career Discovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Student Dashboard Button */}
            <a
              href="/student"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "2px solid var(--accent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent-dim)";
                e.currentTarget.style.color = "var(--accent)";
              }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              Student Dashboard
            </a>

            {/* Status pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: status === "loading" ? "rgba(217, 119, 6, 0.08)" : "rgba(5, 150, 105, 0.08)",
                color: status === "loading" ? "var(--warning)" : "var(--success)",
                border: `2px solid ${status === "loading" ? "var(--warning)" : "var(--success)"}`,
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${status === "loading" ? "animate-breathe" : ""}`}
                style={{
                  background: status === "loading" ? "var(--warning)" : "var(--success)",
                }}
              />
              {status === "loading" ? "Searching..." : "Ready"}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Academic Notice ──────────────────────────── */}
      <AcademicNotice />

      {/* ── Main ────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Search Form */}
        <SearchForm onSubmit={handleScrape} isLoading={status === "loading"} />

        {/* Status Banner */}
        <StatusBanner
          status={status}
          total={total}
          errorMsg={errorMsg}
          lastQuery={lastQuery}
          elapsed={elapsed}
          engine={engine}
          totalSearches={totalSearches}
          deduplicatedCount={deduplicatedCount}
          statusMessages={statusMessages}
        />

        {/* Source link */}
        {scrapeUrl && status === "success" && (
          <div className="mt-3 animate-slide-down">
            <a
              href={scrapeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757"
                />
              </svg>
              View on original platform
            </a>
          </div>
        )}

        {/* ── School/Department Filter ────────────────── */}
        {status === "success" && jobs.length > 0 && Object.keys(schools).length > 0 && (
          <SchoolFilter
            schools={schools}
            selectedSchool={selectedSchool}
            onChange={setSelectedSchool}
            counts={counts}
          />
        )}

        {/* ── Skeleton Loading (initial) ────────────── */}
        {status === "loading" && jobs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="neo-card-static p-5 animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-2" />
                <div className="skeleton h-3 w-1/3 mb-3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* ── Results Grid (real-time stream) ───────── */}
        {(status === "success" || (status === "loading" && jobs.length > 0)) && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {filteredJobs.map((job, i) => (
              <JobCard key={i} job={job} index={i} />
            ))}

            {/* Pulsing card appended at the end when still loading additional pages */}
            {status === "loading" && (
              <div
                className="neo-card-static p-5 animate-progress-pulse"
              >
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-2" />
                <div className="skeleton h-3 w-1/3 mb-3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            )}
          </div>
        )}

        {/* ── Empty State (filtered) ────────────────── */}
        {status === "success" && jobs.length > 0 && filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "var(--surface-1)",
                border: "2px solid var(--card-border)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p
              className="text-base font-bold"
              style={{ color: "var(--foreground)" }}
            >
              No opportunities match this department
            </p>
            <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
              Try a different department or clear the filter to see all results.
            </p>
          </div>
        )}

        {/* ── Empty State (no results) ──────────────── */}
        {status === "success" && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "var(--surface-1)",
                border: "2px solid var(--card-border)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M8 11h6" />
              </svg>
            </div>
            <p
              className="text-base font-bold"
              style={{ color: "var(--foreground)" }}
            >
              No opportunities matched your search
            </p>
            <p className="text-sm mt-1.5 max-w-sm text-center" style={{ color: "var(--muted)" }}>
              Try different keywords, a broader location, or adjust the filters to find more opportunities.
            </p>
            {scrapeUrl && (
              <a
                href={scrapeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                View search on original platform
              </a>
            )}
          </div>
        )}

        {/* ── Idle State ───────────────────────────── */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
              style={{
                background: "var(--accent-dim)",
                border: "2px solid var(--accent)",
                boxShadow: "3px 3px 0 var(--shadow-color)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <p
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Discover Career Opportunities
            </p>
            <p
              className="text-sm mt-2 max-w-md text-center leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Search by role, industry, or department to find relevant
              opportunities across the Bengaluru metro area. Results are
              indexed from publicly available listings.
            </p>
            <div
              className="flex items-center gap-3 mt-6 text-xs font-mono font-medium px-4 py-2 rounded-lg"
              style={{
                color: "var(--muted)",
                background: "var(--surface-1)",
                border: "1.5px solid var(--card-border)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--success)" }}
              />
              Index ready &middot; Updated continuously
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <Footer />
    </div>
  );
}
