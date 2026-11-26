import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { localContentRepository, type ContentRepository } from "./repository";
import { supabaseContentRepository } from "./supabaseRepository";

const PublicContentContext = createContext<ContentRepository>(localContentRepository);

/**
 * The public site always paints approved local content first. When explicitly
 * enabled, independently validated published records replace their matching
 * local fallback; an empty or failed remote result can never blank the site.
 */
export function PublicContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentRepository>(localContentRepository);
  const useRemote =
    import.meta.env.VITE_CONTENT_SOURCE === "supabase" && Boolean(supabaseContentRepository);

  useEffect(() => {
    if (!useRemote || !supabaseContentRepository) return;
    let current = true;
    void Promise.all([
      supabaseContentRepository.getSiteSettings(),
      supabaseContentRepository.getHomepageContent(),
      supabaseContentRepository.getExperience(),
      supabaseContentRepository.getExpertise(),
      supabaseContentRepository.getProjects(),
    ]).then(([profile, homepage, experience, expertise, projects]) => {
      if (!current) return;
      setContent((fallback) => ({
        getSiteSettings: () =>
          profile.state === "ready" ? profile.data : fallback.getSiteSettings(),
        getHomepageContent: () =>
          homepage.state === "ready" ? homepage.data : fallback.getHomepageContent(),
        getExperience: () =>
          experience.state === "ready" ? [...experience.data] : fallback.getExperience(),
        getExpertise: () =>
          expertise.state === "ready" ? [...expertise.data] : fallback.getExpertise(),
        getProjects: () => (projects.state === "ready" ? projects.data : fallback.getProjects()),
        getFeaturedProjects: () => {
          const source = projects.state === "ready" ? projects.data : fallback.getProjects();
          return source.filter((project) => project.featured);
        },
        getProjectBySlug: (slug) => {
          const source = projects.state === "ready" ? projects.data : fallback.getProjects();
          return source.find((project) => project.slug === slug);
        },
      }));
    });
    return () => {
      current = false;
    };
  }, [useRemote]);

  const value = useMemo(() => content, [content]);
  return <PublicContentContext.Provider value={value}>{children}</PublicContentContext.Provider>;
}

export function usePublicContent() {
  return useContext(PublicContentContext);
}
