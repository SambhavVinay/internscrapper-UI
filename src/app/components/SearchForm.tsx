"use client";

import { useState } from "react";

export interface SearchFilters {
  keywords: string;
  location: string;
  experience: string;
  job_type: string;
  work_type: string;
  freshness: string;
  actively_hiring: boolean;
  easy_apply: boolean;
  verified_only: boolean;
  sort_by: string;
}

interface SearchFormProps {
  onSubmit: (filters: SearchFilters) => void;
  isLoading: boolean;
}

/* ── Option definitions ────────────────────────── */
const EXPERIENCE_OPTIONS = [
  { value: "1", label: "Internship" },
  { value: "2", label: "Entry Level" },
  { value: "3", label: "Associate" },
  { value: "4", label: "Mid-Senior" },
  { value: "5", label: "Director" },
  { value: "6", label: "Executive" },
];

const JOB_TYPE_OPTIONS = [
  { value: "F", label: "Full-time" },
  { value: "P", label: "Part-time" },
  { value: "C", label: "Contract" },
  { value: "T", label: "Temporary" },
  { value: "I", label: "Internship" },
  { value: "V", label: "Volunteer" },
];

const WORK_TYPE_OPTIONS = [
  { value: "1", label: "On-site" },
  { value: "2", label: "Hybrid" },
  { value: "3", label: "Remote" },
];

const FRESHNESS_OPTIONS = [
  { value: "r3600", label: "Past 1 hour" },
  { value: "r14400", label: "Past 4 hours" },
  { value: "r86400", label: "Past 24 hours" },
  { value: "r604800", label: "Past week" },
  { value: "r2592000", label: "Past month" },
];

const SORT_OPTIONS = [
  { value: "DD", label: "Newest first" },
  { value: "RD", label: "Relevance" },
];

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [keywords, setKeywords] = useState("Software Engineer");
  const [location, setLocation] = useState("India");
  const [experience, setExperience] = useState<string[]>(["1", "2"]);
  const [jobType, setJobType] = useState<string[]>([]);
  const [workType, setWorkType] = useState<string[]>([]);
  const [freshness, setFreshness] = useState("r86400");
  const [activelyHiring, setActivelyHiring] = useState(true);
  const [easyApply, setEasyApply] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("DD");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleMulti = (
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    val: string
  ) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || !location.trim()) return;
    onSubmit({
      keywords: keywords.trim(),
      location: location.trim(),
      experience: experience.join(","),
      job_type: jobType.join(","),
      work_type: workType.join(","),
      freshness,
      actively_hiring: activelyHiring,
      easy_apply: easyApply,
      verified_only: verifiedOnly,
      sort_by: sortBy,
    });
  };

  const activeFilterCount = [
    experience.length > 0,
    jobType.length > 0,
    workType.length > 0,
    activelyHiring,
    easyApply,
    verifiedOnly,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in-up">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
        }}
      >
        {/* ── Primary Row: Keywords + Location + Button ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label
              htmlFor="search-keywords"
              className="text-xs font-medium tracking-wide uppercase"
              style={{ color: "var(--muted)" }}
            >
              Keywords
            </label>
            <input
              id="search-keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Analyst"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--card-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <label
              htmlFor="search-location"
              className="text-xs font-medium tracking-wide uppercase"
              style={{ color: "var(--muted)" }}
            >
              Location
            </label>
            <input
              id="search-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. United States, Remote"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--card-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              id="scrape-button"
              type="submit"
              disabled={isLoading || !keywords.trim() || !location.trim()}
              className="relative w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: isLoading ? "var(--surface-2)" : "var(--accent)",
                color: isLoading ? "var(--muted)" : "#fff",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  e.currentTarget.style.boxShadow = "0 0 24px 4px var(--accent-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    style={{ animation: "spin 1s linear infinite" }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="60"
                      strokeDashoffset="20"
                    />
                  </svg>
                  Scraping…
                </span>
              ) : (
                "Scrape"
              )}
            </button>
          </div>
        </div>

        {/* ── Filters Toggle ─────────────────────────── */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-xs font-medium transition-colors duration-200 cursor-pointer"
            style={{ color: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a5b4fc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent)")}
          >
            <svg
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            Advanced Filters
            {activeFilterCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Targets{" "}
            <span className="font-medium" style={{ color: "var(--accent)" }}>
              {FRESHNESS_OPTIONS.find((f) => f.value === freshness)?.label || "recent"}
            </span>{" "}
            LinkedIn public listings
          </p>
        </div>

        {/* ── Expanded Filters Panel ─────────────────── */}
        {filtersOpen && (
          <div
            className="mt-4 pt-4 animate-slide-down"
            style={{ borderTop: "1px solid var(--card-border)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Experience Level */}
              <FilterGroup label="Experience Level">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt.value}
                    label={opt.label}
                    active={experience.includes(opt.value)}
                    onClick={() => toggleMulti(experience, setExperience, opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </FilterGroup>

              {/* Job Type */}
              <FilterGroup label="Job Type">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt.value}
                    label={opt.label}
                    active={jobType.includes(opt.value)}
                    onClick={() => toggleMulti(jobType, setJobType, opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </FilterGroup>

              {/* Work Type */}
              <FilterGroup label="Work Type">
                {WORK_TYPE_OPTIONS.map((opt) => (
                  <ChipToggle
                    key={opt.value}
                    label={opt.label}
                    active={workType.includes(opt.value)}
                    onClick={() => toggleMulti(workType, setWorkType, opt.value)}
                    disabled={isLoading}
                  />
                ))}
              </FilterGroup>

              {/* Freshness */}
              <FilterGroup label="Posted Within">
                <select
                  value={freshness}
                  onChange={(e) => setFreshness(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none cursor-pointer transition-all duration-200"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--card-border)",
                    color: "var(--foreground)",
                  }}
                >
                  {FRESHNESS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              {/* Sort */}
              <FilterGroup label="Sort By">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none cursor-pointer transition-all duration-200"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--card-border)",
                    color: "var(--foreground)",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              {/* Boolean Toggles */}
              <FilterGroup label="Quality Filters">
                <BoolToggle
                  label="Actively Hiring"
                  hint="Companies with open headcount"
                  checked={activelyHiring}
                  onChange={setActivelyHiring}
                  disabled={isLoading}
                />
                <BoolToggle
                  label="Easy Apply"
                  hint="Apply directly on LinkedIn"
                  checked={easyApply}
                  onChange={setEasyApply}
                  disabled={isLoading}
                />
                <BoolToggle
                  label="Verified Only"
                  hint="LinkedIn-verified listings"
                  checked={verifiedOnly}
                  onChange={setVerifiedOnly}
                  disabled={isLoading}
                />
              </FilterGroup>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

/* ── Sub-components ────────────────────────────── */

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ChipToggle({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: active ? "var(--accent-dim)" : "var(--surface-1)",
        color: active ? "var(--accent)" : "var(--muted)",
        border: `1px solid ${active ? "rgba(129,140,248,0.25)" : "var(--card-border)"}`,
      }}
    >
      {label}
    </button>
  );
}

function BoolToggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: checked ? "var(--accent-dim)" : "var(--surface-1)",
        border: `1px solid ${checked ? "rgba(129,140,248,0.25)" : "var(--card-border)"}`,
      }}
    >
      <div
        className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors duration-150"
        style={{
          background: checked ? "var(--accent)" : "transparent",
          border: checked ? "none" : "1.5px solid var(--muted)",
        }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: checked ? "var(--accent)" : "var(--foreground)" }}>
          {label}
        </p>
        <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      </div>
    </button>
  );
}
