"use client";

import { useState, useCallback } from "react";
import SearchForm from "./SearchForm";
import type { SearchFilters } from "./SearchForm";
import JobCard from "./JobCard";
import StatusBanner from "./StatusBanner";

const API_BASE = "http://localhost:8000";

export interface Job {
  title: string | null;
  company: string | null;
  location: string | null;
  link: string | null;
  posted: string | null;
  posted_datetime: string | null;
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

  const handleScrape = useCallback(async (filters: SearchFilters) => {
    setStatus("loading");
    setErrorMsg("");
    setJobs([]);
    setEngine("");
    setScrapeUrl("");
    setLastQuery({ keywords: filters.keywords, location: filters.location });

    const startTime = Date.now();

    try {
      const params = new URLSearchParams({
        keywords: filters.keywords,
        location: filters.location,
        experience: filters.experience,
        freshness: filters.freshness,
        actively_hiring: String(filters.actively_hiring),
        easy_apply: String(filters.easy_apply),
        verified_only: String(filters.verified_only),
        sort_by: filters.sort_by,
      });
      if (filters.job_type) params.set("job_type", filters.job_type);
      if (filters.work_type) params.set("work_type", filters.work_type);

      const res = await fetch(
        `${API_BASE}/scrape-internships?${params.toString()}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "error") {
        throw new Error(data.message || "Scraping failed");
      }

      setJobs(data.data || []);
      setTotal(data.total || 0);
      setEngine(data.engine || "");
      setScrapeUrl(data.url || "");
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setStatus("success");
    } catch (err: unknown) {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setStatus("error");
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* ── Header ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: "rgba(6, 6, 10, 0.82)",
          borderColor: "var(--card-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
              }}
            >
              IS
            </div>
            <div>
              <h1
                className="text-base font-semibold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                InternScrapper
              </h1>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                LinkedIn Internship Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Engine badge */}
            {engine && status === "success" && (
              <div
                className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider animate-fade-in-up"
                style={{
                  background:
                    engine === "selenium"
                      ? "rgba(52, 211, 153, 0.1)"
                      : "rgba(129, 140, 248, 0.1)",
                  color:
                    engine === "selenium"
                      ? "var(--success)"
                      : "var(--accent)",
                  border: `1px solid ${
                    engine === "selenium"
                      ? "rgba(52, 211, 153, 0.15)"
                      : "rgba(129, 140, 248, 0.15)"
                  }`,
                }}
              >
                {engine}
              </div>
            )}

            {/* Status pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background:
                  status === "loading"
                    ? "rgba(251, 191, 36, 0.1)"
                    : "rgba(52, 211, 153, 0.1)",
                color:
                  status === "loading" ? "var(--warning)" : "var(--success)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    status === "loading"
                      ? "var(--warning)"
                      : "var(--success)",
                  animation:
                    status === "loading" ? "pulseGlow 1.5s infinite" : "none",
                }}
              />
              {status === "loading" ? "Scraping…" : "System Online"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
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
        />

        {/* Constructed URL (debug link) */}
        {scrapeUrl && status === "success" && (
          <div className="mt-3 animate-slide-down">
            <a
              href={scrapeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors duration-200"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
            >
              <svg
                className="w-3 h-3 shrink-0"
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
              Open this search on LinkedIn ↗
            </a>
          </div>
        )}

        {/* ── Skeleton Loading ──────────────────────── */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 animate-fade-in-up"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
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

        {/* ── Results Grid ─────────────────────────── */}
        {status === "success" && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {jobs.map((job, i) => (
              <JobCard key={i} job={job} index={i} />
            ))}
          </div>
        )}

        {/* ── Empty State ──────────────────────────── */}
        {status === "success" && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5"
              style={{ background: "var(--surface-1)" }}
            >
              🔍
            </div>
            <p
              className="text-base font-medium"
              style={{ color: "var(--foreground)" }}
            >
              No internships found
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Try different keywords, a broader location, or relax the filters.
            </p>
            {scrapeUrl && (
              <a
                href={scrapeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-xs font-medium transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                Verify this search on LinkedIn ↗
              </a>
            )}
          </div>
        )}

        {/* ── Idle State ───────────────────────────── */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-6"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(129, 140, 248, 0.1)",
              }}
            >
              🚀
            </div>
            <p
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Ready to scrape
            </p>
            <p
              className="text-sm mt-1.5 max-w-sm text-center leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Enter keywords and a location, tune the{" "}
              <span style={{ color: "var(--accent)" }}>Advanced Filters</span>{" "}
              for precision, then hit{" "}
              <span style={{ color: "var(--accent)" }}>Scrape</span> to pull
              fresh internships from LinkedIn.
            </p>
            <div
              className="flex items-center gap-4 mt-6 text-[10px] font-mono uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              <span>Selenium</span>
              <span style={{ color: "var(--card-border)" }}>+</span>
              <span>Playwright</span>
              <span style={{ color: "var(--card-border)" }}>+</span>
              <span>BeautifulSoup</span>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer
        className="border-t py-5"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Selenium + Playwright + BeautifulSoup + Next.js
          </p>
          <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
            localhost:8000
          </p>
        </div>
      </footer>
    </div>
  );
}
