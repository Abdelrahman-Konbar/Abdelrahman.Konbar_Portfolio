import { useEffect } from "react";
import { usePublicContent } from "../content/publicContent";
import { Contact } from "../sections/Contact";
import { Experience } from "../sections/Experience";
import { Expertise } from "../sections/Expertise";
import { Hero } from "../sections/Hero";
import { Philosophy } from "../sections/Philosophy";
import { SelectedWork } from "../sections/SelectedWork";

export function Home() {
  const profile = usePublicContent().getSiteSettings();
  useEffect(() => {
    document.title = `${profile.name} — ${profile.role}`;
  }, []);
  return (
    <>
      <Hero />
      <SelectedWork />
      <Expertise />
      <Experience />
      <Philosophy />
      <Contact />
    </>
  );
}
