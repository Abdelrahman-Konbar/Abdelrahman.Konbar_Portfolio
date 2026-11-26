import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, useEffect } from "react";
import { Nav } from "./components/Nav";
import { Arrow, EASE } from "./components/ui";
import { PublicContentProvider, usePublicContent } from "./content/publicContent";
import { matchPublicRoute } from "./lib/routeMatcher";
import { Link, RouterProvider, useRouter } from "./lib/router";
import { CaseStudy } from "./pages/CaseStudy";
import { Home } from "./pages/Home";
import { Resume } from "./pages/Resume";
import { Contact, Footer } from "./sections/Contact";
import type { Project } from "./data/projects";

// Keep the private application out of the public portfolio bundle.
const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));

function NotFound() {
  return (
    <div className="grid min-h-[80svh] place-items-center px-5 pt-24 text-center">
      <div>
        <p className="font-display text-[clamp(5rem,18vw,14rem)] font-medium leading-none tracking-[-0.06em] text-iris">
          404
        </p>
        <p className="mt-4 text-steel">This page doesn’t exist — but the work does.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-canvas px-5 py-3 font-medium text-obsidian hover:bg-iris"
        >
          Back home <Arrow className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function resolve(path: string, getProjectBySlug: (slug: string) => Project | undefined) {
  const route = matchPublicRoute(path);
  if (route.kind === "admin")
    return {
      key: "admin",
      node: (
        <Suspense
          fallback={
            <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-700">
              Loading private workspace…
            </div>
          }
        >
          <Admin />
        </Suspense>
      ),
      admin: true,
    };
  if (route.kind === "home") return { key: "home", node: <Home />, admin: false };
  if (route.kind === "resume")
    return {
      key: "resume",
      node: (
        <>
          <Resume />
          <Contact />
        </>
      ),
      admin: false,
    };
  if (route.kind === "caseStudy") {
    const project = getProjectBySlug(route.slug);
    if (project)
      return { key: `work-${project.slug}`, node: <CaseStudy project={project} />, admin: false };
  }
  return { key: "missing", node: <NotFound />, admin: false };
}

function Page({ children, section }: { children: React.ReactNode; section: string | null }) {
  // Land at the top of a new page, or at the requested section.
  useEffect(() => {
    if (section) {
      requestAnimationFrame(() =>
        document.getElementById(section)?.scrollIntoView({ block: "start" }),
      );
    } else {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function Routes() {
  const { path, section } = useRouter();
  const { getProjectBySlug } = usePublicContent();
  const { key, node, admin } = resolve(path, getProjectBySlug);

  useEffect(() => {
    if (!admin) return;
    const directive = document.createElement("meta");
    directive.name = "robots";
    directive.content = "noindex, nofollow";
    document.head.appendChild(directive);
    return () => directive.remove();
  }, [admin]);

  return (
    <>
      {!admin && <Nav />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <Page section={section}>{node}</Page>
        </motion.main>
      </AnimatePresence>
      {/* Page-change curtain */}
      <AnimatePresence initial={false}>
        <motion.div
          key={key}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] origin-bottom bg-iris"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 1, 0], originY: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, times: [0, 0.4, 0.5, 1], ease: EASE }}
        />
      </AnimatePresence>
      {!admin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <PublicContentProvider>
          <Routes />
        </PublicContentProvider>
      </RouterProvider>
    </MotionConfig>
  );
}
