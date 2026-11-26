import type { CaseStudyBlock, MediaAsset } from "./types";
import type { Project } from "../data/projects";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;
const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const stringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function isCaseStudyBlock(value: unknown): value is CaseStudyBlock {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.order !== "number" ||
    typeof value.type !== "string"
  )
    return false;
  return [
    "heading",
    "richText",
    "image",
    "gallery",
    "quote",
    "callout",
    "comparison",
    "decision",
    "diagram",
    "outcomes",
  ].includes(value.type);
}

export function mapMediaAsset(row: unknown): MediaAsset | undefined {
  if (!isRecord(row)) return undefined;
  const id = stringValue(row.id);
  const storagePath = stringValue(row.storage_path);
  const bucket = stringValue(row.bucket);
  if (!id || !storagePath || !bucket || row.is_public !== true) return undefined;

  return {
    id,
    type: stringValue(row.media_type, "image") as MediaAsset["type"],
    // The adapter replaces this storage reference with a public URL before returning it.
    url: storagePath,
    alt: stringValue(row.alt_text),
    ...(typeof row.width === "number" ? { width: row.width } : {}),
    ...(typeof row.height === "number" ? { height: row.height } : {}),
    ...(typeof row.caption === "string" ? { caption: row.caption } : {}),
  };
}

export function mapPublishedProject(
  row: UnknownRecord,
  media: { cover?: MediaAsset; gallery: MediaAsset[] },
  blocks: CaseStudyBlock[],
): Project | undefined {
  const id = stringValue(row.id);
  const slug = stringValue(row.slug);
  if (!id || !slug || row.status !== "published") return undefined;

  return {
    id,
    slug,
    status: "published",
    publishedAt: stringValue(row.published_at) || undefined,
    order: typeof row.display_order === "number" ? row.display_order : 0,
    name: stringValue(row.name),
    nameAlt: stringValue(row.name_alt) || undefined,
    index: stringValue(row.project_index),
    category: stringValue(row.category),
    kind: stringValue(row.kind),
    tagline: stringValue(row.tagline),
    description: stringValue(row.description),
    focus: stringList(row.focus),
    contribution: stringList(row.contribution),
    atmosphere: (stringValue(row.atmosphere) || "architectural") as Project["atmosphere"],
    featured: row.featured === true,
    media,
    caseStudy: { blocks },
  };
}
