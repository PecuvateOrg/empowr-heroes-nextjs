/**
 * netlify/functions/general-enquiry.js
 *
 * Thin Netlify adapter for the general enquiry form (/contact).
 * No business logic lives here — see core/enquiry-handler.js.
 *
 * Netlify Function endpoint: /.netlify/functions/general-enquiry
 */

const { handleGeneralEnquiry } = require('../../core/enquiry-handler')

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

  return handleGeneralEnquiry(payload, {
    resendApiKey: process.env.RESEND_API_KEY,
    generalEmail: process.env.GENERAL_EMAIL,
  })
}
