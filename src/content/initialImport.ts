import type { SupabaseClient } from "@supabase/supabase-js";
import { experience, expertise, profile } from "../data/profile";
import { projects } from "../data/projects";
import { siteContent } from "../data/site";

type ImportSummary = {
  existing: string[];
  missing: string[];
  conflicts: string[];
  inserted: string[];
};

export class ImportTimeoutError extends Error {
  constructor(stage: string) {
    super(
      `${stage} timed out after 20 seconds. Check the browser Network panel for a pending Supabase request.`,
    );
    this.name = "ImportTimeoutError";
  }
}

async function within<T>(stage: string, work: PromiseLike<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(work),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new ImportTimeoutError(stage)), 20_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const publishedAt = () => new Date().toISOString();
const experienceRows = experience.map((entry, index) => ({
  id: `experience-${String(index + 1).padStart(2, "0")}`,
  organization: entry.org,
  role: entry.role,
  context: entry.context,
  summary: entry.summary,
  display_order: index,
  status: "published" as const,
}));
const expertiseRows = expertise.map((entry, index) => ({
  id: entry.key,
  title: entry.title,
  short_label: entry.short,
  body: entry.body,
  details: entry.detail,
  display_order: index,
  status: "published" as const,
}));
const projectRows = projects.map((project, index) => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  name_alt: project.nameAlt ?? null,
  project_index: project.index,
  category: project.category,
  kind: project.kind,
  tagline: project.tagline,
  description: project.description,
  focus: project.focus,
  contribution: project.contribution,
  atmosphere: project.atmosphere,
  featured: project.featured,
  display_order: index,
  status: "published" as const,
}));

type OrderedRow = { id: string; display_order: number };

async function existingRows(client: SupabaseClient, table: string): Promise<OrderedRow[]> {
  const { data, error } = await client.from(table).select("id,display_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    display_order: Number(row.display_order),
  }));
}

function isEmptyContent(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

/**
 * Imports the approved local snapshot once. Existing database records always
 * win: this intentionally performs inserts only, never an update or upsert.
 */
export async function importApprovedContent(
  client: SupabaseClient,
  report: (stage: string) => void = () => {},
): Promise<ImportSummary> {
  report("Checking existing site settings…");
  const site = await within(
    "Checking site settings",
    client
      .from("site_settings")
      .select("id,profile,homepage,resume,seo,status,published_at")
      .eq("id", "primary")
      .maybeSingle(),
  );
  report("Checking existing experience records…");
  const remoteExperience = await within(
    "Checking experience records",
    existingRows(client, "experience_entries"),
  );
  report("Checking existing expertise records…");
  const remoteExpertise = await within(
    "Checking expertise records",
    existingRows(client, "expertise_entries"),
  );
  report("Checking existing projects…");
  const remoteProjects = await within(
    "Checking projects",
    client.from("projects").select("id,slug,display_order"),
  );
  if (site.error) throw site.error;
  if (remoteProjects.error) throw remoteProjects.error;
  const existingExperience = new Set(remoteExperience.map((row) => row.id));
  const existingExpertise = new Set(remoteExpertise.map((row) => row.id));
  const existingProjects = new Set((remoteProjects.data ?? []).map((row) => String(row.id)));

  const existing: string[] = [];
  const missing: string[] = [];
  const conflicts: string[] = [];
  const emptySiteScaffold =
    site.data !== null &&
    [site.data.profile, site.data.homepage, site.data.resume, site.data.seo].every(isEmptyContent);
  if (site.data && !emptySiteScaffold) existing.push("site_settings/primary");
  else missing.push("site_settings/primary");
  for (const row of [...experienceRows, ...expertiseRows]) {
    const collection =
      "organization" in row ? "experience" : "title" in row ? "expertise" : "project";
    const known =
      collection === "experience"
        ? existingExperience
        : collection === "expertise"
          ? existingExpertise
          : existingProjects;
    (known.has(row.id) ? existing : missing).push(`${collection}/${row.id}`);
  }
  const remoteProjectBySlug = new Map(
    (remoteProjects.data ?? []).map((row) => [String(row.slug), String(row.id)]),
  );
  const occupiedProjectOrders = new Map(
    (remoteProjects.data ?? []).map((row) => [Number(row.display_order), String(row.id)]),
  );
  const importableProjects = projectRows.filter((project) => {
    const remoteIdForSlug = remoteProjectBySlug.get(project.slug);
    if (remoteIdForSlug && remoteIdForSlug !== project.id) {
      conflicts.push(`project/${project.slug} has remote ID ${remoteIdForSlug}`);
      return false;
    }
    const remoteIdForOrder = occupiedProjectOrders.get(project.display_order);
    if (remoteIdForOrder && remoteIdForOrder !== project.id) {
      conflicts.push(
        `project/${project.id} conflicts with remote display order ${project.display_order}`,
      );
      return false;
    }
    (existingProjects.has(project.id) ? existing : missing).push(`project/${project.id}`);
    return !existingProjects.has(project.id);
  });

  const inserted: string[] = [];
  const stamp = publishedAt();
  if (!site.data || emptySiteScaffold) {
    const row = {
      id: "primary",
      profile,
      homepage: siteContent.homepage,
      resume: siteContent.resume,
      seo: siteContent.seo,
      status: "published",
      published_at: stamp,
    };
    report(site.data ? "Filling the empty site-settings scaffold…" : "Creating site settings…");
    const { error } = site.data
      ? await within(
          "Writing site settings",
          client.from("site_settings").update(row).eq("id", "primary"),
        )
      : await within("Writing site settings", client.from("site_settings").insert(row));
    if (error) throw error;
    inserted.push("site_settings/primary");
  }
  const insertMissing = async (
    table: string,
    rows: { id: string }[],
    known: Set<string>,
    occupiedOrders: Map<number, string>,
    label: string,
  ) => {
    const missingRows = rows.filter((row) => {
      if (known.has(row.id)) return false;
      const ordered = row as { id: string; display_order?: number };
      const occupiedBy =
        ordered.display_order === undefined ? undefined : occupiedOrders.get(ordered.display_order);
      if (occupiedBy && occupiedBy !== row.id) {
        conflicts.push(
          `${label}/${row.id} conflicts with remote display order ${ordered.display_order}`,
        );
        return false;
      }
      return true;
    });
    if (!missingRows.length) return;
    report(`Writing ${missingRows.length} ${label} record${missingRows.length === 1 ? "" : "s"}…`);
    const { error } = await within(
      `Writing ${label} records`,
      client.from(table).insert(missingRows.map((row) => ({ ...row, published_at: stamp }))),
    );
    if (error) throw error;
    inserted.push(...missingRows.map((row) => `${label}/${row.id}`));
  };
  await insertMissing(
    "experience_entries",
    experienceRows,
    existingExperience,
    new Map(remoteExperience.map((row) => [row.display_order, row.id])),
    "experience",
  );
  await insertMissing(
    "expertise_entries",
    expertiseRows,
    existingExpertise,
    new Map(remoteExpertise.map((row) => [row.display_order, row.id])),
    "expertise",
  );
  if (importableProjects.length) {
    report(
      `Writing ${importableProjects.length} project record${importableProjects.length === 1 ? "" : "s"}…`,
    );
    const { error } = await within(
      "Writing project records",
      client
        .from("projects")
        .insert(importableProjects.map((row) => ({ ...row, published_at: stamp }))),
    );
    if (error) throw error;
    inserted.push(...importableProjects.map((row) => `project/${row.id}`));
  }
  return { existing, missing, conflicts, inserted };
}
