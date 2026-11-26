export type PublicationStatus = "draft" | "published" | "archived";

export type PublishingInfo = {
  status: PublicationStatus;
  publishedAt?: string;
  order: number;
};

export type MediaType = "image" | "video" | "document";

/** A CMS-neutral media reference. `url` can later become a signed storage URL. */
export type MediaAsset = {
  id: string;
  type: MediaType;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  focalPoint?: { x: number; y: number };
};

export type RichTextBlock = { id: string; type: "richText"; order: number; body: string };
export type HeadingBlock = {
  id: string;
  type: "heading";
  order: number;
  text: string;
  level?: 2 | 3;
};
export type ImageBlock = {
  id: string;
  type: "image";
  order: number;
  media: MediaAsset;
  caption?: string;
};
export type GalleryBlock = { id: string; type: "gallery"; order: number; images: MediaAsset[] };
export type QuoteBlock = {
  id: string;
  type: "quote";
  order: number;
  quote: string;
  attribution?: string;
};
export type CalloutBlock = {
  id: string;
  type: "callout";
  order: number;
  title: string;
  body: string;
};
export type ComparisonBlock = {
  id: string;
  type: "comparison";
  order: number;
  before?: MediaAsset;
  after?: MediaAsset;
  beforeLabel?: string;
  afterLabel?: string;
};
export type DecisionBlock = { id: string; type: "decision"; order: number; decisionId: string };
export type DiagramBlock = {
  id: string;
  type: "diagram";
  order: number;
  media?: MediaAsset;
  description?: string;
};
export type OutcomesBlock = { id: string; type: "outcomes"; order: number; items: string[] };

/** Ordered, CMS-ready blocks. Presentation remains intentionally independent of any CMS vendor. */
export type CaseStudyBlock =
  | HeadingBlock
  | RichTextBlock
  | ImageBlock
  | GalleryBlock
  | QuoteBlock
  | CalloutBlock
  | ComparisonBlock
  | DecisionBlock
  | DiagramBlock
  | OutcomesBlock;

export type SocialLink = {
  label: string;
  url: string;
  isPlaceholder?: boolean;
};

export type SeoMetadata = {
  title: string;
  description: string;
};
