/**
 * netlify/functions/patron-enquiry.js
 *
 * Thin Netlify adapter for the Founding Patron enquiry form.
 * No business logic lives here — see core/enquiry-handler.js.
 *
 * Netlify Function endpoint: /.netlify/functions/patron-enquiry
 */

const { handlePatronEnquiry } = require('../../core/enquiry-handler')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }
  }

  return handlePatronEnquiry(payload, {
    resendApiKey: process.env.RESEND_API_KEY,
    patronEmail: process.env.PATRON_EMAIL,
  })
}
