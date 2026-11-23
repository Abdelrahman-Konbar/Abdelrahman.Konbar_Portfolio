import type { SeoMetadata } from "../content/types";

export const siteContent = {
  seo: {
    title: "Abdelrahman Konbar — Product Designer & Design Engineer",
    description:
      "Explore Abdelrahman Konbar’s product design and engineering portfolio, featuring enterprise SaaS projects, professional experience, resume access, and contact details for hiring teams.",
  } satisfies SeoMetadata,
  homepage: {
    hero: {
      screenReaderHeadline: "I make complex products feel simple.",
      lines: ["I make", "complex", "products", "feel", "simple."],
      role: "Product Designer & Design Engineer",
      description:
        " for B2B SaaS and enterprise software. I turn tangled workflows, roles, and data into products people understand at first glance — and help build them.",
      meta: {
        basedIn: "Alexandria, EG",
        availability: "Open to remote roles",
        focus: "B2B SaaS · Enterprise",
        practice: "Design → Code",
      },
    },
    selectedWork: {
      heading: ["Every product here", "was a system before", "it was a screen."],
      description:
        "Enterprise construction, logistics operations, and pharmacy retail — three domains where the hard part is the structure underneath the interface.",
      notice: "Full case studies and project visuals are being prepared.",
    },
    expertise: {
      heading: ["From the problem", "to production."],
      description:
        "Not a list of tools — one continuous practice. Each strength hands off to the next, which is what lets an idea survive all the way into a shipped interface.",
    },
    experience: {
      heading: ["Where the", "practice was", "built."],
      description:
        "From agency work on B2B SaaS to founding my own studio — each role sharpened how I approach complex products.",
    },
    philosophy: {
      manifesto:
        "Complex products don’t need more interface. They need someone willing to understand the whole system — every role, rule, and exception — and then do the hard work of making it feel obvious.",
      tenets: [
        {
          id: "understand-system",
          numeral: "I",
          title: "Understand the system before drawing the screen.",
          body: "Workflows, permissions, and edge cases come first. The interface is the last expression of a structure that has to be right.",
        },
        {
          id: "earn-place",
          numeral: "II",
          title: "Every element earns its place.",
          body: "In dense enterprise products, clarity comes from what you remove and how you order what remains.",
        },
        {
          id: "built",
          numeral: "III",
          title: "Design is finished when it’s built.",
          body: "I design with implementation in mind and work in code, so decisions hold up when they meet real data.",
        },
      ],
    },
    contact: {
      availability: "Available for remote roles",
      heading: ["Have a complex", "product? Let’s talk."],
      description:
        "I’m looking for remote Product Designer roles on teams building B2B SaaS and enterprise software — where the problems are tangled and the bar for clarity is high.",
    },
  },
  resume: {
    profile:
      "Product Designer & Design Engineer specialising in B2B SaaS, enterprise systems, and complex digital products. I work across product thinking, enterprise UX, interface design, design systems, and front-end implementation.",
  },
} as const;
