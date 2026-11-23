export type Atmosphere = 'architectural' | 'operational' | 'clinical'

export type DecisionOption = { label: string; note: string }
export type Decision = {
  challenge: string
  context: string
  alternatives: DecisionOption[]
  constraints: string[]
  chosenIndex: number
  rationale: string
  result: string
  isSample?: boolean
}

/**
 * Case-study content. Every field is optional — the template renders an
 * elegant, clearly labelled placeholder for anything not yet written.
 * Shape is CMS-ready: map these fields 1:1 to collection fields later.
 */
export type CaseStudy = {
  summary?: string
  businessProblem?: string
  userProblem?: string
  responsibilities?: string[]
  research?: string // only include when research was actually conducted
  strategy?: string
  decisions?: Decision[]
  architecture?: string
  exploration?: string
  designSystem?: string
  engineering?: string
  outcomes?: string[] // verified outcomes only
  learnings?: string
}

export type Project = {
  slug: string
  name: string
  nameAlt?: string
  index: string
  category: string
  kind: string
  tagline: string
  description: string
  focus: string[]
  contribution: string[]
  atmosphere: Atmosphere
  featured: boolean
  media: { cover?: string; gallery?: string[] }
  caseStudy: CaseStudy
}

export const projects: Project[] = [
  {
    slug: 'masar',
    name: 'MASAR',
    nameAlt: 'مسار',
    index: '01',
    category: 'Enterprise construction management',
    kind: 'Enterprise platform',
    tagline: 'Bringing order to the moving parts of construction.',
    description:
      'An enterprise platform for construction project operations — where procurement, approvals, and role-based work meet in one bilingual product.',
    focus: [
      'Complex enterprise workflows',
      'Project operations',
      'Role-based experiences',
      'Procurement & approvals',
      'Bilingual interfaces (AR / EN)',
    ],
    contribution: ['UX architecture', 'Interface design', 'Design engineering'],
    atmosphere: 'architectural',
    featured: true,
    media: {},
    caseStudy: {},
  },
  {
    slug: 'meridian',
    name: 'MERIDIAN',
    index: '02',
    category: 'Logistics operations',
    kind: 'Multi-portal platform',
    tagline: 'One operation, seen clearly from every role.',
    description:
      'A logistics operations platform spanning multiple portals — connecting the roles, shipment workflows, and operational visibility that keep goods moving.',
    focus: [
      'Interconnected operational roles',
      'Shipment workflows',
      'Operational visibility',
      'Information architecture',
      'Complex systems thinking',
    ],
    contribution: ['Information architecture', 'Systems design', 'Interface design'],
    atmosphere: 'operational',
    featured: true,
    media: {},
    caseStudy: {},
  },
  {
    slug: 'pharmacyos',
    name: 'PharmacyOS',
    index: '03',
    category: 'Pharmacy management',
    kind: 'Product demonstration',
    tagline: 'The everyday work of a pharmacy, made calm.',
    description:
      'A pharmacy management product demonstration covering inventory and sales workflows, built with a focus on usability and a coherent interface system.',
    focus: ['Inventory', 'Sales workflows', 'Product usability', 'Interface systems', 'Functional implementation'],
    contribution: ['Product design', 'Interface system', 'Front-end implementation'],
    atmosphere: 'clinical',
    featured: false,
    media: {},
    caseStudy: {},
  },
]

// Illustrates the Decision Explorer format. Not project history.
export const sampleDecision: Decision = {
  isSample: true,
  challenge: 'How should pending approvals surface for someone who approves across many projects?',
  context:
    'Sample scenario used to demonstrate the format. Real decisions from each project will replace this content.',
  alternatives: [
    { label: 'Notifications only', note: 'Lightweight, but approvals get buried among unrelated alerts.' },
    { label: 'Per-project inbox', note: 'Clear ownership, but forces constant context-switching.' },
    { label: 'Unified approval queue', note: 'One prioritised list across projects with inline context.' },
  ],
  constraints: [
    'Approvers work across several projects at once',
    'Each request needs enough context to decide without leaving',
    'Permissions differ per role and project',
  ],
  chosenIndex: 2,
  rationale:
    'A unified queue matches how approvers actually think — by urgency, not by project — while inline context reduces navigation.',
  result:
    'The resulting experience would be shown here with real imagery and only verified observations.',
}

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug)
  return projects[(i + 1) % projects.length]
}
