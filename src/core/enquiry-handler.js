/**
 * core/enquiry-handler.js
 *
 * Business logic for the two enquiry forms (Founding Patron, general).
 * No dependency on Netlify, Express, or any hosting platform.
 *
 * Two functions, not one config-driven function — the required fields,
 * recipient, and tone differ enough between them that a shared config
 * object would just move the difference somewhere else. What genuinely
 * repeats (escaping, honeypot check, the Resend send shape) is factored
 * out below.
 *
 * See planning/specs/patron-enquiry-form_spec.md and
 * planning/specs/general-enquiry-form_spec.md.
 */

const { Resend } = require('resend')
const {
  buildPatronInternalNotificationHtml,
  buildPatronInternalNotificationText,
  buildPatronAcknowledgementHtml,
  buildPatronAcknowledgementText,
  buildGeneralInternalNotificationHtml,
  buildGeneralInternalNotificationText,
  buildGeneralAcknowledgementHtml,
  buildGeneralAcknowledgementText,
} = require('./email-template')

const FROM = 'Empowr Heroes <hero@empowrcic.org>'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Bots fill in the honeypot; real visitors never see it. Returning a plain
// boolean (not throwing) lets each handler decide how to respond — both
// currently respond 200/{success:true} so the bot doesn't retry.
function isHoneypotTriggered(payload, fieldName) {
  const value = payload && payload[fieldName]
  return typeof value === 'string' && value.trim().length > 0
}

const SUCCESS = { statusCode: 200, body: JSON.stringify({ success: true }) }
function errorResponse(statusCode, message) {
  return { statusCode, body: JSON.stringify({ error: message }) }
}

// ---------------------------------------------------------------------------
// Patron enquiry
// ---------------------------------------------------------------------------

/**
 * @param {object} payload - parsed JSON body from the request
 * @param {object} env
 * @param {string} env.resendApiKey
 * @param {string} [env.patronEmail]
 */
async function handlePatronEnquiry(payload, { resendApiKey, patronEmail }) {
  if (isHoneypotTriggered(payload, 'website')) {
    console.warn('[enquiry-handler] Patron honeypot triggered — dropping submission')
    return SUCCESS
  }

  const { name, email, organisation, phone, interest, commitment, message } = payload || {}

  if (!name?.trim() || !email?.trim() || !interest?.trim() || !message?.trim()) {
    return errorResponse(400, 'Missing required fields')
  }

  const toEmail = patronEmail || 'patron@empowrcic.org'
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    organisation: organisation ? escapeHtml(organisation) : '',
    phone: phone ? escapeHtml(phone) : '',
    interest: escapeHtml(interest),
    commitment: commitment ? escapeHtml(commitment) : '',
    message: escapeHtml(message),
  }

  const resend = new Resend(resendApiKey)

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: email,
      subject: `Founding Patron enquiry: ${name}${organisation ? ` — ${organisation}` : ''}`,
      html: buildPatronInternalNotificationHtml(safe),
      text: buildPatronInternalNotificationText(safe),
    })

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Thank you for your enquiry — Empowr CIC',
      html: buildPatronAcknowledgementHtml({ name: safe.name }),
      text: buildPatronAcknowledgementText({ name: safe.name }),
    })
  } catch (err) {
    console.error('[enquiry-handler] Patron enquiry send error:', err.message)
    return errorResponse(500, 'Failed to send enquiry')
  }

  return SUCCESS
}

// ---------------------------------------------------------------------------
// General enquiry
// ---------------------------------------------------------------------------

/**
 * @param {object} payload - parsed JSON body from the request
 * @param {object} env
 * @param {string} env.resendApiKey
 * @param {string} [env.generalEmail]
 */
async function handleGeneralEnquiry(payload, { resendApiKey, generalEmail }) {
  if (isHoneypotTriggered(payload, 'company')) {
    console.warn('[enquiry-handler] General honeypot triggered — dropping submission')
    return SUCCESS
  }

  const { name, email, topic, message } = payload || {}

  if (!name?.trim() || !email?.trim() || !topic?.trim() || !message?.trim()) {
    return errorResponse(400, 'Missing required fields')
  }

  const toEmail = generalEmail || 'hero@empowrcic.org'
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    topic: escapeHtml(topic),
    message: escapeHtml(message),
  }

  const resend = new Resend(resendApiKey)

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: email,
      subject: `General enquiry: ${name} — ${topic}`,
      html: buildGeneralInternalNotificationHtml(safe),
      text: buildGeneralInternalNotificationText(safe),
    })

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Thanks for reaching out — Empowr Heroes",
      html: buildGeneralAcknowledgementHtml({ name: safe.name }),
      text: buildGeneralAcknowledgementText({ name: safe.name }),
    })
  } catch (err) {
    console.error('[enquiry-handler] General enquiry send error:', err.message)
    return errorResponse(500, 'Failed to send enquiry')
  }

  return SUCCESS
}

module.exports = { handlePatronEnquiry, handleGeneralEnquiry }
