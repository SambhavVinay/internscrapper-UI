"use client";

import type { Job } from "./InternshipDashboard";

interface JobCardProps {
  job: Job;
  index: number;
}

export default function JobCard({ job, index }: JobCardProps) {
  const staggerClass = `stagger-${Math.min(index + 1, 10)}`;

  return (
    <div
      className={`neo-card p-5 animate-fade-in-up ${staggerClass}`}
    >
      {/* Header row: Title + Posted badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2 flex-1"
          style={{ color: "var(--foreground)" }}
        >
          {job.title || "Position Details Pending"}
        </h3>
        {job.posted && (
          <span
            className="shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1.5px solid var(--accent)",
            }}
          >
            {job.posted}
          </span>
        )}
      </div>

      {/* Company */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
          }}
        >
          {job.company?.[0]?.toUpperCase() || "?"}
        </div>
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--foreground)" }}
        >
          {job.company || "Organization Pending"}
        </p>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 shrink-0"
          style={{ color: "var(--muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
        <p className="text-sm truncate" style={{ color: "var(--muted)" }}>
          {job.location || "Location not specified"}
        </p>
      </div>

      {/* Program tags */}
      {job.programs && job.programs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.programs.slice(0, 3).map((prog) => (
            <span
              key={prog}
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: "var(--surface-1)",
                color: "var(--muted)",
                border: "1.5px solid var(--card-border)",
              }}
            >
              {prog}
            </span>
          ))}
          {job.programs.length > 3 && (
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: "var(--surface-1)",
                color: "var(--muted)",
                border: "1.5px solid var(--card-border)",
              }}
            >
              +{job.programs.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div
        className="pt-3"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        {job.link ? (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-150"
            style={{ color: "var(--accent)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = "10px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = "8px";
            }}
          >
            View Original Listing
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </a>
        ) : (
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Original listing unavailable
          </span>
        )}
      </div>
    </div>
  );
}
