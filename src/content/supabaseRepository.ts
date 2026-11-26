import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "../data/projects";
import { profile, type Experience, expertise } from "../data/profile";
import { siteContent } from "../data/site";
import { supabase } from "../lib/supabase";
import { mapMediaAsset, mapPublishedProject, isCaseStudyBlock } from "./supabaseMapping";
import type { ContentRepository } from "./repository";
import type { CaseStudyBlock, MediaAsset } from "./types";

export type RemoteContentResult<T> =
  | { state: "notConfigured" }
  | { state: "empty" }
  | { state: "ready"; data: T }
  | { state: "error"; message: string };

/** Async equivalent of ContentRepository for the future remote adapter. */
export interface RemoteContentRepository {
  getSiteSettings(): Promise<RemoteContentResult<typeof profile>>;
  getHomepageContent(): Promise<RemoteContentResult<typeof siteContent.homepage>>;
  getExperience(): Promise<RemoteContentResult<readonly Experience[]>>;
  getExpertise(): Promise<RemoteContentResult<typeof expertise>>;
  getProjects(): Promise<RemoteContentResult<readonly Project[]>>;
  getProjectBySlug(slug: string): Promise<RemoteContentResult<Project>>;
}

type RecordRow = Record<string, unknown>;

function message(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load published portfolio content.";
}

function object(value: unknown): RecordRow | undefined {
  return typeof value === "object" && value !== null ? (value as RecordRow) : undefined;
}

function publishedRow<T>(
  data: T | null,
  error: { message: string } | null,
): RemoteContentResult<T> {
  if (error) return { state: "error", message: error.message };
  return data ? { state: "ready", data } : { state: "empty" };
}

async function projectMedia(client: SupabaseClient, projectId: string) {
  const { data, error } = await client
    .from("project_media")
    .select("role, display_order, media_assets(*)")
    .eq("project_id", projectId)
    .order("display_order");
  if (error) throw error;

  const gallery: MediaAsset[] = [];
  let resolvedCover: MediaAsset | undefined;
  for (const relation of data ?? []) {
    const asset = mapMediaAsset((relation as RecordRow).media_assets);
    if (!asset) continue;
    // Storage is intentionally private. Phase 03B will resolve approved media IDs
    // through the server-side `media-url` Edge Function; retain placeholders until then.
    const { data: signed, error: urlError } = await client.functions.invoke("media-url", {
  body: { mediaId: asset.id },
});
if (urlError) throw urlError;
asset.url = signed?.url ?? "";
    if ((relation as RecordRow).role === "cover") resolvedCover = asset;
    else gallery.push(asset);
  }
  return { ...(resolvedCover ? { cover: resolvedCover } : {}), gallery };
}

async function projectBlocks(client: SupabaseClient, projectId: string): Promise<CaseStudyBlock[]> {
  const { data, error } = await client
    .from("case_study_blocks")
    .select("id, block_type, display_order, payload")
    .eq("project_id", projectId)
    .eq("status", "published")
    .order("display_order");
  if (error) throw error;

  const rows = (data ?? []).map((row) => row as RecordRow);
  const mediaIds = rows.flatMap((row) => {
    const payload = object(row.payload) ?? {};
    return [
      payload.mediaId,
      payload.beforeMediaId,
      payload.afterMediaId,
      ...(Array.isArray(payload.mediaIds) ? payload.mediaIds : []),
    ].filter((id): id is string => typeof id === "string");
  });
  const mediaById = new Map<string, MediaAsset>();
  if (mediaIds.length) {
    const { data: mediaRows } = await client
      .from("media_assets")
      .select("*")
      .in("id", [...new Set(mediaIds)]);
    for (const mediaRow of mediaRows ?? []) {
      const asset = mapMediaAsset(mediaRow);
      if (asset) mediaById.set(asset.id, { ...asset, url: "" });
    }
  }
  return rows
    .map((record) => {
      const payload = object(record.payload) ?? {};
      const media =
        typeof payload.mediaId === "string" ? mediaById.get(payload.mediaId) : undefined;
      const gallery = Array.isArray(payload.mediaIds)
        ? payload.mediaIds
            .map((id) => mediaById.get(String(id)))
            .filter((item): item is MediaAsset => Boolean(item))
        : [];
      const block = {
        ...payload,
        id: record.id,
        type: record.block_type,
        order: record.display_order,
      } as RecordRow;
      if (media && block.type === "image") block.media = media;
      if (media && block.type === "diagram") block.media = media;
      if (block.type === "gallery") block.images = gallery;
      if (block.type === "comparison") {
        if (typeof payload.beforeMediaId === "string")
          block.before = mediaById.get(payload.beforeMediaId);
        if (typeof payload.afterMediaId === "string")
          block.after = mediaById.get(payload.afterMediaId);
      }
      return block;
    })
    .filter(isCaseStudyBlock);
}

async function mapProject(client: SupabaseClient, row: RecordRow) {
  const [media, blocks] = await Promise.all([
    projectMedia(client, String(row.id)),
    projectBlocks(client, String(row.id)),
  ]);
  return mapPublishedProject(row, media, blocks);
}

export function createSupabaseContentRepository(client: SupabaseClient): RemoteContentRepository {
  return {
    async getSiteSettings() {
      const { data, error } = await client
        .from("site_settings")
        .select("profile")
        .eq("id", "primary")
        .eq("status", "published")
        .maybeSingle();
      const result = publishedRow(data, error);
      if (result.state !== "ready") return result;
      const value = object((result.data as RecordRow).profile);
      return value && typeof value.name === "string"
        ? { state: "ready", data: value as typeof profile }
        : { state: "error", message: "Published profile content is invalid." };
    },
    async getHomepageContent() {
      const { data, error } = await client
        .from("site_settings")
        .select("homepage")
        .eq("id", "primary")
        .eq("status", "published")
        .maybeSingle();
      const result = publishedRow(data, error);
      if (result.state !== "ready") return result;
      return object((result.data as RecordRow).homepage)
        ? {
            state: "ready",
            data: (result.data as RecordRow).homepage as typeof siteContent.homepage,
          }
        : { state: "error", message: "Published homepage content is invalid." };
    },
    async getExperience() {
      const { data, error } = await client
        .from("experience_entries")
        .select("organization, role, context, summary")
        .eq("status", "published")
        .order("display_order");
      if (error) return { state: "error", message: error.message };
      const entries = (data ?? []).map((row) => {
        const value = row as RecordRow;
        return {
          org: String(value.organization ?? ""),
          role: String(value.role ?? ""),
          context: String(value.context ?? ""),
          summary: String(value.summary ?? ""),
        } satisfies Experience;
      });
      return entries.length ? { state: "ready", data: entries } : { state: "empty" };
    },
    async getExpertise() {
      const { data, error } = await client
        .from("expertise_entries")
        .select("id, title, short_label, body, details")
        .eq("status", "published")
        .order("display_order");
      if (error) return { state: "error", message: error.message };
      const entries = (data ?? []).map((row) => {
        const value = row as RecordRow;
        return {
          key: String(value.id ?? ""),
          title: String(value.title ?? ""),
          short: String(value.short_label ?? ""),
          body: String(value.body ?? ""),
          detail: Array.isArray(value.details)
            ? value.details.filter((item): item is string => typeof item === "string")
            : [],
        };
      });
      return entries.length
        ? { state: "ready", data: entries as typeof expertise }
        : { state: "empty" };
    },
    async getProjects() {
      try {
        const { data, error } = await client
          .from("projects")
          .select("*")
          .eq("status", "published")
          .order("display_order");
        if (error) return { state: "error", message: error.message };
        const projects = (
          await Promise.all((data ?? []).map((row) => mapProject(client, row as RecordRow)))
        ).filter((project): project is Project => Boolean(project));
        return projects.length ? { state: "ready", data: projects } : { state: "empty" };
      } catch (error) {
        return { state: "error", message: message(error) };
      }
    },
    async getProjectBySlug(slug) {
      try {
        const { data, error } = await client
          .from("projects")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
        if (error) return { state: "error", message: error.message };
        if (!data) return { state: "empty" };
        const project = await mapProject(client, data as RecordRow);
        return project ? { state: "ready", data: project } : { state: "empty" };
      } catch (error) {
        return { state: "error", message: message(error) };
      }
    },
  };
}

export const supabaseContentRepository = supabase
  ? createSupabaseContentRepository(supabase)
  : null;

// Compile-time guard: the remote adapter intentionally mirrors public project methods.
export type PublicRepositoryContract = Pick<ContentRepository, "getProjects" | "getProjectBySlug">;
