// Canonical project data for the "Support a Project" section. Single source
// of truth — every page that shows a project reads from here. Adding a
// project is a one-file change (no new page needed — /projects/[project] is
// a dynamic route driven entirely by this file). See ops/runbooks/add-a-project.md.
//
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
  'the-bridge': {
    name: 'The Bridge — A Home for Empowr',
    emoji: '🏗️',
    tagline: 'Help us bring the former Bridge Leisure Centre in Sydenham back to life as a permanent Empowr space',
    lead: 'Turn an empty leisure centre into a home for the community',
    body: 'your support helps us secure and convert the former Bridge Leisure Centre on Kangley Bridge Road into a permanent space for skating, wellbeing and experiential learning, so our sessions no longer depend on hired halls.',
    short: 'A permanent Empowr space at the former Bridge Leisure Centre',
    goalAmount: null,
    status: 'active',
    impactAreas: [
      { icon: '🔑', title: 'Securing the Building', body: 'Taking on the lease of a building that has stood empty for years.' },
      { icon: '🛠️', title: 'Making It Safe & Skateable', body: 'Repairs, flooring and safety work to bring it up to standard.' },
      { icon: '🏠', title: 'A Permanent Home', body: 'A space of our own instead of relying on hired halls.' },
      { icon: '🌱', title: 'More Sessions, More People', body: 'Room to run more sessions and new wellbeing programmes for SE London.' },
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
export const PROJECT_ORDER: ProjectKey[] = ['the-bridge', 'the-pathway']

/** Full sentence form, same convention as tierDesc() in tiers.ts. */
export function projectDesc(key: ProjectKey): string {
  return `${PROJECTS[key].lead} — ${PROJECTS[key].body}`
}
