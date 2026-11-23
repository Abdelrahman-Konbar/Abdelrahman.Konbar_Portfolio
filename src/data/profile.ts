// Verified professional information. Edit here — every section reads from this file.
export const profile = {
  name: 'Abdelrahman Konbar',
  firstName: 'Abdelrahman',
  lastName: 'Konbar',
  role: 'Product Designer & Design Engineer',
  location: 'Alexandria, Egypt',
  timezone: 'Africa/Cairo',
  availability: 'Open to remote opportunities',
  email: 'abdelrahmankonbar@gmail.com',
  specialization: ['B2B SaaS', 'Enterprise Systems', 'Complex Digital Products'],
  // TODO: replace with the exact LinkedIn profile URL. Until then this opens a LinkedIn people search.
  linkedinUrl: 'https://www.linkedin.com/search/results/people/?keywords=Abdelrahman%20Konbar',
  linkedinIsPlaceholder: true,
  // TODO: add the PDF (e.g. place it at /public/resume.pdf and set '/resume.pdf').
  resumePdfUrl: null as string | null,
}

export type Experience = {
  org: string
  role: string
  context: string
  summary: string
}

// Descriptions are intentionally restrained — confirm or expand with verified detail.
export const experience: Experience[] = [
  {
    org: 'TAVIO',
    role: 'Founder / Product Designer & Design Engineer',
    context: 'Founder',
    summary:
      'Founded TAVIO, where I shape product direction and carry design work from first concept through to implementation.',
  },
  {
    org: 'SART',
    role: 'UX/UI Designer',
    context: 'B2B SaaS agency',
    summary:
      'Designed interfaces and user flows for business software within a B2B SaaS-focused agency.',
  },
  {
    org: 'Bluesense AI',
    role: 'UI/UX Design Intern',
    context: 'Internship',
    summary: 'Contributed to interface and user experience work as part of the design team.',
  },
  {
    org: 'Independent',
    role: 'Freelance Product Designer',
    context: 'Freelance',
    summary: 'Partner directly with clients on product and interface design for digital products.',
  },
]

export const expertise = [
  {
    key: 'discovery',
    title: 'Product Thinking & Discovery',
    short: 'Problem',
    body: 'Framing the right problem before designing a solution — understanding the business, the people using the product, and the constraints that shape both.',
    detail: ['Problem framing', 'Stakeholder alignment', 'Requirement mapping', 'Prioritisation'],
  },
  {
    key: 'systems',
    title: 'Enterprise UX & Systems Thinking',
    short: 'Structure',
    body: 'Untangling roles, permissions, approvals, and interdependent workflows into an information architecture people can actually navigate.',
    detail: ['Information architecture', 'Role-based flows', 'Multi-portal products', 'Workflow modelling'],
  },
  {
    key: 'visual',
    title: 'Visual & Interaction Design',
    short: 'Experience',
    body: 'Interfaces with clear hierarchy and considered behaviour — dense data made legible, and interactions that explain themselves.',
    detail: ['Interface design', 'Data-dense layouts', 'Interaction & motion', 'Bilingual / RTL'],
  },
  {
    key: 'systems-design',
    title: 'Design Systems',
    short: 'Scale',
    body: 'Components, tokens, and patterns that keep a growing product consistent and let teams move faster without losing quality.',
    detail: ['Tokens & theming', 'Component libraries', 'Pattern documentation', 'Accessibility'],
  },
  {
    key: 'engineering',
    title: 'Design Engineering',
    short: 'Production',
    body: 'Closing the gap between the file and the product — building interfaces in code and speaking the same language as engineering.',
    detail: ['React & TypeScript', 'Front-end prototyping', 'Design-to-code handoff', 'Implementation QA'],
  },
]
