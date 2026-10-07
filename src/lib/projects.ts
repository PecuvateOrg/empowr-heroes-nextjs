// Canonical project data for the "Support a Project" section. Single source
// of truth — every page that shows a project reads from here. Adding a
// project is a one-file change (no new page needed — /projects/[project] is
// a dynamic route driven entirely by this file). See ops/runbooks/add-a-project.md.
//
import { LINKS } from '@/lib/links'

// Unlike tiers.ts, projects have NO separate Stripe Payment Link. Backing a
// project hands off to the existing tier/checkout flow with a `project` query
// param, which CheckoutConfirm appends to the Stripe URL as `client_reference_id`
// — Stripe delivers it back on the webhook's `session.client_reference_id`
// without needing a dedicated Payment Link per project. See donation-handler.ts.
//
// The shape is an explicit type (not inferred via `as const`, unlike tiers.ts)
// so the app still type-checks correctly with zero projects — TIERS never goes
// to zero entries so it never hit this, but PROJECTS legitimately can.

export type ImpactArea = {
  icon: string
  title: string
  body: string
}

export type Project = {
  name: string          // e.g. "Skate Sessions — Leeds"
  emoji: string          // shown on cards + detail hero
  tagline: string        // one-line hook for the list card
  lead: string            // bolded opening phrase, e.g. "Give young people in Leeds a reason to show up"
  body: string            // rest of the sentence — what the money funds, in plain language
  short: string           // terser one-liner, kept for parity with tiers.ts's copy convention
  goalAmount: number | null // GBP funding target; null = not costed yet, shows "target coming soon" with no bar
  status: 'active' | 'funded' | 'closed'
  impactAreas: ImpactArea[] // exactly 4, shown on the detail page
  about?: string[]       // optional extra paragraphs on the detail page (the longer story)
  places?: { name: string; note: string; href: string }[] // optional "spaces we're working to secure" list; href comes from LINKS
}

export type ProjectKey = string

// TEMPLATE — copy this shape for a new project (see ops/runbooks/add-a-project.md):
//
// export const PROJECTS: Record<ProjectKey, Project> = {
//   'your-project-slug': {
//     name: 'Display Name',
//     emoji: '🛹',
//     tagline: 'One-line hook for the list card',
//     lead: 'Short opening phrase',
//     body: 'rest of the full sentence — what the money funds, in plain language.',
//     short: 'Terser one-liner',
//     goalAmount: 3000,
//     status: 'active',
//     impactAreas: [
//       { icon: '🛹', title: 'Venue & Equipment', body: 'What this covers, one sentence' },
//       { icon: '🧑‍🏫', title: 'Coaching', body: '...' },
//       { icon: '🎟️', title: 'Free Access', body: '...' },
//       { icon: '📈', title: 'Consistency', body: '...' },
//     ],
//   },
// }
//
// export const PROJECT_ORDER: ProjectKey[] = ['your-project-slug']
//
// The Notion `Project` select property already exists on the Donations DB —
// no manual Notion step needed, the option is created automatically on first
// donation logged against the new project.

export const PROJECTS: Record<ProjectKey, Project> = {
  'eela-spaces': {
    name: 'EELA Spaces — Empty Places, Social Value',
    emoji: '🏗️',
    tagline: 'Help us turn abandoned buildings into community spaces for wellbeing, learning and belonging',
    lead: 'Turn abandoned places into spaces with social value',
    body: 'your support helps us secure and convert empty buildings, many of them disused council properties, into permanent EELA Spaces: community hubs where people move, connect and grow, starting with skating.',
    short: 'Converting empty buildings into permanent community spaces',
    goalAmount: null,
    status: 'active',
    about: [
      'Empowr began with a simple observation: across our communities were countless empty halls and unused spaces, sitting idle for most of the week. We set out to bring life back into them as hubs of experiential learning.',
      'An EELA Space is a permanent home for Empowr Experiential Learning Activities: a place where people of all ages learn by doing, and build confidence, connection and wellbeing along the way. Every Space starts with skating, through our MoveWell programme, and grows from there.',
      'Today we rely on hired halls. A space of our own means more sessions, more people reached, and a building that gives back to the community around it instead of standing empty.',
    ],
    places: [
      { name: 'The Bridge, Sydenham', note: 'The former Bridge Leisure Centre on Kangley Bridge Road, empty for years. Our first priority.', href: LINKS.projects.bridgeListing },
    ],
    impactAreas: [
      { icon: '🔑', title: 'Securing Buildings', body: 'Taking on empty buildings and bringing them back into community use.' },
      { icon: '🛠️', title: 'Making Them Safe & Usable', body: 'Repairs, flooring and safety work to bring each space up to standard.' },
      { icon: '🛼', title: 'Starting With Skating', body: 'Each Space opens with MoveWell skating sessions, then grows.' },
      { icon: '🤝', title: 'Lasting Social Value', body: 'Places that build wellbeing, belonging and opportunity, not empty buildings.' },
    ],
  },
  'the-pathway': {
    name: 'The Pathway — From Skater to Coach',
    emoji: '🧭',
    tagline: 'Help young people and adults grow from skaters into certified coaches',
    lead: 'Turn skaters into leaders',
    body: 'your support funds a three-step pathway: young Junior Champions from around 13 learn responsibility helping in kids\' sessions, 16–17s train as Junior Assistant Coaches, and adults certify as coaches through our Empowr Certified Coaching Programme, ready to lead classes and work with schools and partners.',
    short: 'A pathway from skater to certified coach',
    goalAmount: null,
    status: 'active',
    impactAreas: [
      { icon: '⭐', title: 'Junior Champions (13+)', body: 'Young people help in kids\' sessions and build leadership and responsibility.' },
      { icon: '🤝', title: 'Junior Assistant Coaches (16–17)', body: 'Supported, supervised coaching with training and certification.' },
      { icon: '🎓', title: 'Adult Coach Certification', body: 'Adults train from Assistant to Head Coach through our certified programme.' },
      { icon: '🏫', title: 'Work With Partners', body: 'Certified coaches are offered work with schools and community organisations.' },
    ],
  },
}

/** Display order for the projects list. Empty = /projects shows its "no open projects" state. */
export const PROJECT_ORDER: ProjectKey[] = ['eela-spaces', 'the-pathway']

/** Full sentence form, same convention as tierDesc() in tiers.ts. */
export function projectDesc(key: ProjectKey): string {
  return `${PROJECTS[key].lead} — ${PROJECTS[key].body}`
}
