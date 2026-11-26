import { writeFile } from "node:fs/promises";
import { experience, expertise, profile } from "../src/data/profile.ts";
import { projects } from "../src/data/projects.ts";
import { siteContent } from "../src/data/site.ts";

const target = "supabase/seed/approved-content.sql";
const text = (value: string | null) =>
  value === null
    ? "null"
    : `$approved$${value.replaceAll("$approved$", "$approved_text$")}$approved$`;
const json = (value: unknown) => `${text(JSON.stringify(value))}::jsonb`;
const published = "'published'::public.content_status";

const statements = [
  `insert into public.site_settings (id, profile, homepage, resume, seo, status, published_at)
values ('primary', ${json(profile)}, ${json(siteContent.homepage)}, ${json(siteContent.resume)}, ${json(siteContent.seo)}, ${published}, now())
on conflict do nothing;`,
  ...experience.map(
    (
      entry,
      index,
    ) => `insert into public.experience_entries (id, organization, role, context, summary, display_order, status, published_at)
values (${text(`experience-${String(index + 1).padStart(2, "0")}`)}, ${text(entry.org)}, ${text(entry.role)}, ${text(entry.context)}, ${text(entry.summary)}, ${index}, ${published}, now())
on conflict do nothing;`,
  ),
  ...expertise.map(
    (
      entry,
      index,
    ) => `insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values (${text(entry.key)}, ${text(entry.title)}, ${text(entry.short)}, ${text(entry.body)}, ${json(entry.detail)}, ${index}, ${published}, now())
on conflict do nothing;`,
  ),
  ...projects.map(
    (
      project,
      index,
    ) => `insert into public.projects (id, slug, name, name_alt, project_index, category, kind, tagline, description, focus, contribution, atmosphere, featured, display_order, status, published_at)
values (${text(project.id)}, ${text(project.slug)}, ${text(project.name)}, ${text(project.nameAlt ?? null)}, ${text(project.index)}, ${text(project.category)}, ${text(project.kind)}, ${text(project.tagline)}, ${text(project.description)}, ${json(project.focus)}, ${json(project.contribution)}, ${text(project.atmosphere)}, ${project.featured}, ${index}, ${published}, now())
on conflict do nothing;`,
  ),
];

const sql = `-- Approved local portfolio seed. Generated from src/data on ${new Date().toISOString()}.
-- Safe to rerun: every statement is insert-only and skips all conflicts.
-- It deliberately contains no media, project_media, or case_study_blocks records.

begin;

${statements.join("\n\n")}

commit;
`;

await writeFile(target, sql, "utf8");
console.log(`Wrote ${target}`);
