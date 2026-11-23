export type PublicRoute =
  | { kind: "home" }
  | { kind: "resume" }
  | { kind: "caseStudy"; slug: string }
  | { kind: "notFound" };

/** Pure public-route matcher, kept separate from rendering for smoke coverage. */
export function matchPublicRoute(path: string): PublicRoute {
  if (path === "/") return { kind: "home" };
  if (path === "/resume") return { kind: "resume" };

  const match = path.match(/^\/work\/([\w-]+)$/);
  return match ? { kind: "caseStudy", slug: match[1] } : { kind: "notFound" };
}
