-- Approved local portfolio seed. Generated from src/data on 2026-11-24T17:10:16.940Z.
-- Safe to rerun: every statement is insert-only and skips all conflicts.
-- It deliberately contains no media, project_media, or case_study_blocks records.

begin;

insert into public.site_settings (id, profile, homepage, resume, seo, status, published_at)
values ('primary', $approved${"name":"Abdelrahman Konbar","firstName":"Abdelrahman","lastName":"Konbar","role":"Product Designer & Design Engineer","location":"Alexandria, Egypt","timezone":"Africa/Cairo","availability":"Open to remote opportunities","email":"abdelrahmankonbar@gmail.com","specialization":["B2B SaaS","Enterprise Systems","Complex Digital Products"],"linkedinUrl":"https://www.linkedin.com/search/results/people/?keywords=Abdelrahman%20Konbar","linkedinIsPlaceholder":true,"resumePdfUrl":null}$approved$::jsonb, $approved${"hero":{"screenReaderHeadline":"I make complex products feel simple.","lines":["I make","complex","products","feel","simple."],"role":"Product Designer & Design Engineer","description":" for B2B SaaS and enterprise software. I turn tangled workflows, roles, and data into products people understand at first glance — and help build them.","meta":{"basedIn":"Alexandria, EG","availability":"Open to remote roles","focus":"B2B SaaS · Enterprise","practice":"Design → Code"}},"selectedWork":{"heading":["Every product here","was a system before","it was a screen."],"description":"Enterprise construction, logistics operations, and pharmacy retail — three domains where the hard part is the structure underneath the interface.","notice":"Full case studies and project visuals are being prepared."},"expertise":{"heading":["From the problem","to production."],"description":"Not a list of tools — one continuous practice. Each strength hands off to the next, which is what lets an idea survive all the way into a shipped interface."},"experience":{"heading":["Where the","practice was","built."],"description":"From agency work on B2B SaaS to founding my own studio — each role sharpened how I approach complex products."},"philosophy":{"manifesto":"Complex products don’t need more interface. They need someone willing to understand the whole system — every role, rule, and exception — and then do the hard work of making it feel obvious.","tenets":[{"id":"understand-system","numeral":"I","title":"Understand the system before drawing the screen.","body":"Workflows, permissions, and edge cases come first. The interface is the last expression of a structure that has to be right."},{"id":"earn-place","numeral":"II","title":"Every element earns its place.","body":"In dense enterprise products, clarity comes from what you remove and how you order what remains."},{"id":"built","numeral":"III","title":"Design is finished when it’s built.","body":"I design with implementation in mind and work in code, so decisions hold up when they meet real data."}]},"contact":{"availability":"Available for remote roles","heading":["Have a complex","product? Let’s talk."],"description":"I’m looking for remote Product Designer roles on teams building B2B SaaS and enterprise software — where the problems are tangled and the bar for clarity is high."}}$approved$::jsonb, $approved${"profile":"Product Designer & Design Engineer specialising in B2B SaaS, enterprise systems, and complex digital products. I work across product thinking, enterprise UX, interface design, design systems, and front-end implementation."}$approved$::jsonb, $approved${"title":"Abdelrahman Konbar — Product Designer & Design Engineer","description":"Explore Abdelrahman Konbar’s product design and engineering portfolio, featuring enterprise SaaS projects, professional experience, resume access, and contact details for hiring teams."}$approved$::jsonb, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.experience_entries (id, organization, role, context, summary, display_order, status, published_at)
values ($approved$experience-01$approved$, $approved$TAVIO$approved$, $approved$Founder / Product Designer & Design Engineer$approved$, $approved$Founder$approved$, $approved$Founded TAVIO, where I shape product direction and carry design work from first concept through to implementation.$approved$, 0, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.experience_entries (id, organization, role, context, summary, display_order, status, published_at)
values ($approved$experience-02$approved$, $approved$SART$approved$, $approved$UX/UI Designer$approved$, $approved$B2B SaaS agency$approved$, $approved$Designed interfaces and user flows for business software within a B2B SaaS-focused agency.$approved$, 1, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.experience_entries (id, organization, role, context, summary, display_order, status, published_at)
values ($approved$experience-03$approved$, $approved$Bluesense AI$approved$, $approved$UI/UX Design Intern$approved$, $approved$Internship$approved$, $approved$Contributed to interface and user experience work as part of the design team.$approved$, 2, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.experience_entries (id, organization, role, context, summary, display_order, status, published_at)
values ($approved$experience-04$approved$, $approved$Independent$approved$, $approved$Freelance Product Designer$approved$, $approved$Freelance$approved$, $approved$Partner directly with clients on product and interface design for digital products.$approved$, 3, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values ($approved$discovery$approved$, $approved$Product Thinking & Discovery$approved$, $approved$Problem$approved$, $approved$Framing the right problem before designing a solution — understanding the business, the people using the product, and the constraints that shape both.$approved$, $approved$["Problem framing","Stakeholder alignment","Requirement mapping","Prioritisation"]$approved$::jsonb, 0, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values ($approved$systems$approved$, $approved$Enterprise UX & Systems Thinking$approved$, $approved$Structure$approved$, $approved$Untangling roles, permissions, approvals, and interdependent workflows into an information architecture people can actually navigate.$approved$, $approved$["Information architecture","Role-based flows","Multi-portal products","Workflow modelling"]$approved$::jsonb, 1, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values ($approved$visual$approved$, $approved$Visual & Interaction Design$approved$, $approved$Experience$approved$, $approved$Interfaces with clear hierarchy and considered behaviour — dense data made legible, and interactions that explain themselves.$approved$, $approved$["Interface design","Data-dense layouts","Interaction & motion","Bilingual / RTL"]$approved$::jsonb, 2, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values ($approved$systems-design$approved$, $approved$Design Systems$approved$, $approved$Scale$approved$, $approved$Components, tokens, and patterns that keep a growing product consistent and let teams move faster without losing quality.$approved$, $approved$["Tokens & theming","Component libraries","Pattern documentation","Accessibility"]$approved$::jsonb, 3, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.expertise_entries (id, title, short_label, body, details, display_order, status, published_at)
values ($approved$engineering$approved$, $approved$Design Engineering$approved$, $approved$Production$approved$, $approved$Closing the gap between the file and the product — building interfaces in code and speaking the same language as engineering.$approved$, $approved$["React & TypeScript","Front-end prototyping","Design-to-code handoff","Implementation QA"]$approved$::jsonb, 4, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.projects (id, slug, name, name_alt, project_index, category, kind, tagline, description, focus, contribution, atmosphere, featured, display_order, status, published_at)
values ($approved$project-masar$approved$, $approved$masar$approved$, $approved$MASAR$approved$, $approved$مسار$approved$, $approved$01$approved$, $approved$Enterprise construction management$approved$, $approved$Enterprise platform$approved$, $approved$Bringing order to the moving parts of construction.$approved$, $approved$An enterprise platform for construction project operations — where procurement, approvals, and role-based work meet in one bilingual product.$approved$, $approved$["Complex enterprise workflows","Project operations","Role-based experiences","Procurement & approvals","Bilingual interfaces (AR / EN)"]$approved$::jsonb, $approved$["UX architecture","Interface design","Design engineering"]$approved$::jsonb, $approved$architectural$approved$, true, 0, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.projects (id, slug, name, name_alt, project_index, category, kind, tagline, description, focus, contribution, atmosphere, featured, display_order, status, published_at)
values ($approved$project-meridian$approved$, $approved$meridian$approved$, $approved$MERIDIAN$approved$, null, $approved$02$approved$, $approved$Logistics operations$approved$, $approved$Multi-portal platform$approved$, $approved$One operation, seen clearly from every role.$approved$, $approved$A logistics operations platform spanning multiple portals — connecting the roles, shipment workflows, and operational visibility that keep goods moving.$approved$, $approved$["Interconnected operational roles","Shipment workflows","Operational visibility","Information architecture","Complex systems thinking"]$approved$::jsonb, $approved$["Information architecture","Systems design","Interface design"]$approved$::jsonb, $approved$operational$approved$, true, 1, 'published'::public.content_status, now())
on conflict do nothing;

insert into public.projects (id, slug, name, name_alt, project_index, category, kind, tagline, description, focus, contribution, atmosphere, featured, display_order, status, published_at)
values ($approved$project-pharmacyos$approved$, $approved$pharmacyos$approved$, $approved$PharmacyOS$approved$, null, $approved$03$approved$, $approved$Pharmacy management$approved$, $approved$Product demonstration$approved$, $approved$The everyday work of a pharmacy, made calm.$approved$, $approved$A pharmacy management product demonstration covering inventory and sales workflows, built with a focus on usability and a coherent interface system.$approved$, $approved$["Inventory","Sales workflows","Product usability","Interface systems","Functional implementation"]$approved$::jsonb, $approved$["Product design","Interface system","Front-end implementation"]$approved$::jsonb, $approved$clinical$approved$, false, 2, 'published'::public.content_status, now())
on conflict do nothing;

commit;
