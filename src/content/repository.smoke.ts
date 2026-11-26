import assert from "node:assert/strict";
import { contentRepository } from "./repository.ts";
import { mapMediaAsset, mapPublishedProject } from "./supabaseMapping.ts";
import { getSupabaseClient } from "../lib/supabase.ts";
import { matchPublicRoute } from "../lib/routeMatcher.ts";

const projects = contentRepository.getProjects();

assert.ok(contentRepository.getSiteSettings().name);
assert.ok(contentRepository.getHomepageContent().hero.description);
assert.ok(contentRepository.getExperience().length > 0);
assert.ok(contentRepository.getFeaturedProjects().every((project) => project.featured));
assert.ok(projects.length > 0);
assert.deepEqual(contentRepository.getProjectBySlug(projects[0].slug), projects[0]);
assert.equal(contentRepository.getProjectBySlug("missing-project"), undefined);
assert.deepEqual(matchPublicRoute("/"), { kind: "home" });
assert.deepEqual(matchPublicRoute("/resume"), { kind: "resume" });
assert.deepEqual(matchPublicRoute("/admin"), { kind: "admin" });
assert.deepEqual(matchPublicRoute(`/work/${projects[0].slug}`), {
  kind: "caseStudy",
  slug: projects[0].slug,
});
assert.deepEqual(matchPublicRoute("/not-a-route"), { kind: "notFound" });

const media = mapMediaAsset({
  id: "media-cover",
  bucket: "portfolio-public",
  storage_path: "projects/masar/cover.webp",
  media_type: "image",
  alt_text: "MASAR interface",
  is_public: true,
});
assert.ok(media);
const remoteProject = mapPublishedProject(
  {
    id: "project-test",
    slug: "test-project",
    status: "published",
    published_at: "2026-11-24T00:00:00.000Z",
    display_order: 1,
    name: "Test",
    project_index: "01",
    category: "Test category",
    kind: "Test kind",
    tagline: "Test tagline",
    description: "Test description",
    focus: ["Focus"],
    contribution: ["Contribution"],
    atmosphere: "architectural",
    featured: true,
  },
  { cover: media, gallery: [] },
  [],
);
assert.equal(remoteProject?.media.cover?.id, "media-cover");
assert.equal(
  mapPublishedProject({ id: "draft", slug: "draft", status: "draft" }, { gallery: [] }, []),
  undefined,
);
assert.equal(
  getSupabaseClient(),
  null,
  "Node smoke runs without Vite public environment configuration",
);

console.log(`Content smoke test passed for ${projects.length} projects.`);
