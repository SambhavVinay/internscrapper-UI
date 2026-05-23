"use client";

import { useState, useEffect } from "react";
import JobCard from "./JobCard";
import ThemeToggle from "./ThemeToggle";
import type { Job } from "./InternshipDashboard";

const API_BASE = "http://localhost:8000";

interface TimeframeData {
  jobs: Job[];
  count: number;
}

interface StudentDashboardData {
  "1_hour": TimeframeData;
  "2_hours": TimeframeData;
  "5_hours": TimeframeData;
  "24_hours": TimeframeData;
}

export default function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/student/jobs/all-timeframes?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 1 minute for real-time shifting
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
              SD
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                Student Dashboard
              </h1>
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Latest Opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to Admin Button */}
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200"
              style={{
                background: "var(--surface-1)",
                color: "var(--muted)",
                border: "2px solid var(--card-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-dim)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-1)";
                e.currentTarget.style.color = "var(--muted)";
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Admin Panel
            </a>

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              suppressHydrationWarning
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200"
              style={{
                background: loading ? "var(--surface-1)" : "var(--accent-dim)",
                color: loading ? "var(--muted)" : "var(--accent)",
                border: `2px solid ${loading ? "var(--card-border)" : "var(--accent)"}`,
              }}
            >
              <svg
                className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            {/* Status pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: loading ? "rgba(217, 119, 6, 0.08)" : error ? "rgba(239, 68, 68, 0.08)" : "rgba(5, 150, 105, 0.08)",
                color: loading ? "var(--warning)" : error ? "var(--error)" : "var(--success)",
                border: `2px solid ${loading ? "var(--warning)" : error ? "var(--error)" : "var(--success)"}`,
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${loading ? "animate-breathe" : ""}`}
                style={{
                  background: loading ? "var(--warning)" : error ? "var(--error)" : "var(--success)",
                }}
              />
              {loading ? "Loading..." : error ? "Error" : "Live"}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Last Updated Info */}
        {lastUpdated && !loading && (
          <div className="mb-6 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.08)", border: "2px solid var(--error)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--error)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="space-y-8">
            {[1, 24].map((hours) => (
              <div key={hours}>
                <div className="skeleton h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="neo-card-static p-5 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="skeleton h-5 w-3/4 mb-3" />
                      <div className="skeleton h-4 w-1/2 mb-2" />
                      <div className="skeleton h-3 w-1/3 mb-3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Sections */}
        {data && !loading && (
          <div className="space-y-12">
            {[
              {
                id: "1_hour" as const,
                title: "Latest Opportunities (Last Hour)",
                desc: (c: number) => `${c} opportunities found in the last hour`,
                empty: "No new opportunities in the last hour",
                isRecent: true,
              },
              {
                id: "2_hours" as const,
                title: "1 - 2 Hours Ago",
                desc: (c: number) => `${c} opportunities found 1 to 2 hours ago`,
                empty: "No opportunities from 1-2 hours ago",
                isRecent: false,
              },
              {
                id: "5_hours" as const,
                title: "2 - 5 Hours Ago",
                desc: (c: number) => `${c} opportunities found 2 to 5 hours ago`,
                empty: "No opportunities from 2-5 hours ago",
                isRecent: false,
              },
              {
                id: "24_hours" as const,
                title: "5 - 24 Hours Ago",
                desc: (c: number) => `${c} opportunities from the past 24 hours`,
                empty: "No opportunities from the past 24 hours",
                isRecent: false,
              }
            ].map(section => (
              <section key={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: section.isRecent ? "var(--accent-dim)" : "var(--surface-1)",
                      border: section.isRecent ? "2px solid var(--accent)" : "2px solid var(--card-border)",
                    }}
                  >
                    {section.isRecent ? (
                      <svg className="w-4 h-4" fill="var(--accent)" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="var(--muted)" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold tracking-tight"
                      style={{ color: "var(--foreground)" }}
                    >
                      {section.title}
                    </h2>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {section.desc(data[section.id]?.count || 0)}
                    </p>
                  </div>
                </div>

                {(data[section.id]?.jobs || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(data[section.id]?.jobs || []).map((job, i) => (
                      <JobCard key={`${section.id}-${i}`} job={job} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "var(--surface-1)",
                        border: "2px solid var(--card-border)",
                      }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="var(--muted)"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                      {section.empty}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Empty State - No Data */}
        {data && !loading && 
          (data["1_hour"]?.count || 0) === 0 && 
          (data["2_hours"]?.count || 0) === 0 && 
          (data["5_hours"]?.count || 0) === 0 && 
          (data["24_hours"]?.count || 0) === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
              style={{
                background: "var(--surface-1)",
                border: "2px solid var(--card-border)",
              }}
            >
              <svg
                width="28"
                height="28"
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
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              No Opportunities Yet
            </p>
            <p
              className="text-sm mt-2 max-w-md text-center leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Opportunities will appear here as they are discovered through the admin panel.
              Check back later or ask an admin to run a search.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}