import { useEffect, useState } from "react";
import type { CaseStudyBlock, MediaAsset } from "../content/types";
import { supabase } from "../lib/supabase";
import { MediaPlaceholder } from "./MediaPlaceholder";

function SignedMedia({ media, label }: { media: MediaAsset; label: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase || !media.id) return;
    void supabase.functions
      .invoke("media-url", { body: { mediaId: media.id } })
      .then(({ data }) => {
        if (active && typeof data?.url === "string") setUrl(data.url);
      });
    return () => {
      active = false;
    };
  }, [media.id]);
  return (
    <MediaPlaceholder
      src={url}
      alt={media.alt}
      label={label}
      ratio="16 / 9"
      className="rounded-2xl"
    />
  );
}

/** Renders only published, typed blocks. Empty block collections leave the approved template untouched. */
export function CaseStudyBlocks({ blocks }: { blocks?: readonly CaseStudyBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <section aria-label="Case study details" className="border-t border-ink/10 bg-canvas text-ink">
      <div className="mx-auto max-w-[960px] space-y-10 px-5 py-24 sm:px-8 lg:px-12">
        {blocks
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((block) => {
            if (block.type === "heading")
              return block.level === 3 ? (
                <h3 key={block.id} className="font-display text-3xl font-medium tracking-[-0.03em]">
                  {block.text}
                </h3>
              ) : (
                <h2 key={block.id} className="font-display text-5xl font-medium tracking-[-0.04em]">
                  {block.text}
                </h2>
              );
            if (block.type === "richText")
              return (
                <p key={block.id} className="max-w-3xl whitespace-pre-line text-lg leading-relaxed">
                  {block.body}
                </p>
              );
            if (block.type === "quote")
              return (
                <figure key={block.id} className="border-l-2 border-iris pl-6">
                  <blockquote className="font-display text-3xl leading-tight tracking-[-0.03em]">
                    {block.quote}
                  </blockquote>
                  {block.attribution && (
                    <figcaption className="mt-4 text-sm text-ink/60">
                      {block.attribution}
                    </figcaption>
                  )}
                </figure>
              );
            if (block.type === "callout")
              return (
                <aside
                  key={block.id}
                  className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-6"
                >
                  <h3 className="font-display text-2xl">{block.title}</h3>
                  <p className="mt-3 whitespace-pre-line leading-relaxed">{block.body}</p>
                </aside>
              );
            if (block.type === "outcomes")
              return (
                <ul key={block.id} className="grid gap-4 md:grid-cols-2">
                  {block.items.map((item) => (
                    <li key={item} className="rounded-2xl border border-ink/10 p-6 text-lg">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            if (block.type === "image" && block.media)
              return (
                <figure key={block.id}>
                  <SignedMedia media={block.media} label="Case study image" />
                  {(block.caption || block.media.caption) && (
                    <figcaption className="mt-3 text-sm text-ink/60">
                      {block.caption || block.media.caption}
                    </figcaption>
                  )}
                </figure>
              );
            if (block.type === "gallery")
              return (
                <div key={block.id} className="grid gap-4 md:grid-cols-2">
                  {block.images.map((media) => (
                    <SignedMedia key={media.id} media={media} label="Case study image" />
                  ))}
                </div>
              );
            if (block.type === "diagram" && block.media)
              return (
                <figure key={block.id}>
                  <SignedMedia media={block.media} label="Workflow diagram" />
                  {block.description && (
                    <figcaption className="mt-3 text-sm text-ink/60">
                      {block.description}
                    </figcaption>
                  )}
                </figure>
              );
            if (block.type === "comparison")
              return (
                <div key={block.id} className="grid gap-4 md:grid-cols-2">
                  {block.before && (
                    <SignedMedia media={block.before} label={block.beforeLabel || "Before"} />
                  )}
                  {block.after && (
                    <SignedMedia media={block.after} label={block.afterLabel || "After"} />
                  )}
                </div>
              );
            // Decision blocks deliberately do not fabricate a decision from an ID.
            return null;
          })}
      </div>
    </section>
  );
}
