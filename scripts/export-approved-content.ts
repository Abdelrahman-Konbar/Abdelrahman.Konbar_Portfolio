import { writeFile } from "node:fs/promises";
import { experience, expertise, profile } from "../src/data/profile.ts";
import { projects } from "../src/data/projects.ts";
import { siteContent } from "../src/data/site.ts";

const destination =
  process.argv.slice(2).find((argument) => argument !== "--") ??
  "supabase/seed/approved-content.json";

const snapshot = {
  generatedAt: new Date().toISOString(),
  siteSettings: {
    profile,
    homepage: siteContent.homepage,
    resume: siteContent.resume,
    seo: siteContent.seo,
  },
  experience,
  expertise,
  projects,
};

await writeFile(destination, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Wrote approved local-content snapshot to ${destination}`);
