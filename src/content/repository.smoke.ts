import assert from "node:assert/strict";
import { contentRepository } from "./repository.ts";
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
assert.deepEqual(matchPublicRoute(`/work/${projects[0].slug}`), {
  kind: "caseStudy",
  slug: projects[0].slug,
});
assert.deepEqual(matchPublicRoute("/not-a-route"), { kind: "notFound" });

console.log(`Content smoke test passed for ${projects.length} projects.`);
