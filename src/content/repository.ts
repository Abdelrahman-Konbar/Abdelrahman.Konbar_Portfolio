import { experience, expertise, profile } from "../data/profile.ts";
import { getProject, projects, type Project } from "../data/projects.ts";
import { siteContent } from "../data/site.ts";

/**
 * CMS-neutral read boundary. A future remote adapter can implement this shape
 * without requiring presentation components to know about its vendor or API.
 */
export interface ContentRepository {
  getSiteSettings(): typeof profile;
  getHomepageContent(): typeof siteContent.homepage;
  getExperience(): typeof experience;
  getExpertise(): typeof expertise;
  getProjects(): readonly Project[];
  getFeaturedProjects(): readonly Project[];
  getProjectBySlug(slug: string): Project | undefined;
}

export const localContentRepository: ContentRepository = {
  getSiteSettings: () => profile,
  getHomepageContent: () => siteContent.homepage,
  getExperience: () => experience,
  getExpertise: () => expertise,
  getProjects: () => projects,
  getFeaturedProjects: () => projects.filter((project) => project.featured),
  getProjectBySlug: (slug) => getProject(slug),
};

export const contentRepository = localContentRepository;
