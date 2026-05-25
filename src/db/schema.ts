import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const scrapedJobs = pgTable(
  "scraped_jobs",
  {
    id: serial("id").primaryKey(),

    title: text("title"),

    company: text("company"),

    location: text("location"),

    link: text("link").unique(),

    posted: text("posted"),

    postedDatetime: timestamp("posted_datetime"),

    programs: jsonb("programs")
      .$type<string[]>()
      .default([]),

    schools: jsonb("schools")
      .$type<string[]>()
      .default([]),

    scrapedAt: timestamp("scraped_at")
      .defaultNow(),

    keywords: text("keywords"),

    freshness: text("freshness"),

    workTypes: jsonb("work_types")
      .$type<string[]>()
      .default([]),

    jobTypes: jsonb("job_types")
      .$type<string[]>()
      .default([]),
  },
  (table) => ({
    scrapedAtIdx: index("idx_scraped_at")
      .on(table.scrapedAt),

    linkIdx: index("idx_link")
      .on(table.link),
  })
);