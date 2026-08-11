// Topic taxonomy for the general enquiry form (/contact).
// Kept in its own file so a future topic can branch into a scheduling flow
// (Calendly / video call) without restructuring the form or handler.
// See planning/specs/general-enquiry-form_spec.md — Future extension point.

export const ENQUIRY_TOPICS = [
  'General question about tiers or giving',
  'Membership or billing question',
  'Press or media enquiry',
  'Something else',
] as const

export type EnquiryTopic = typeof ENQUIRY_TOPICS[number]
