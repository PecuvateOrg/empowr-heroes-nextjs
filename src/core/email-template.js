/**
 * core/email-template.js
 *
 * Builds the HTML and plain text bodies for donor emails.
 * Separated from donation-handler.js so the template can be updated
 * independently of the handler logic.
 *
 * Hero email functions receive { name, tierData } and return a string.
 * One-time email functions receive { name, siteUrl } and return a string.
 */


const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/28E00iavGdHc0r3gfM18c00'

/**
 * Shared brand mantra block — appears at the bottom of all emails.
 * @returns {string} HTML string
 */
function buildMantraHtml() {
  return `
              <!-- Mantra -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e1db;padding-top:24px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px;font-size:15px;font-style:italic;line-height:1.8;">
                      <span style="color:#FF6161;">Live by growing.</span>
                      <span style="color:#4A70C2;"> Grow by learning.</span>
                      <span style="color:#1B1B1B;"> Learn by doing.</span>
                    </p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#1B1B1B;">Together, we move wellbeing forward—one action at a time.</p>
                  </td>
                </tr>
              </table>`
}

/**
 * @param {object} params
 * @param {string} params.name      - Donor full name
 * @param {object} params.tierData  - Tier config object from TIER_CONFIG
 */
function buildEmailHtml({ name, tierData }) {
  const firstName = name ? name.split(' ')[0] : 'Hero'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're an Empowr Hero</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;">You're an Empowr Hero ${tierData.emoji}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 40px;">
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Hi ${firstName},
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Thank you so much for becoming an <strong>Empowr Hero</strong>. Your support means the world to us and to every person whose life is shaped by the sessions you're helping to make possible.
              </p>
              <!-- Tier card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Your Hero Tier</p>
                    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a2e;">${tierData.emoji} ${tierData.label}</p>
                    <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;">${tierData.desc}</p>
                    <p style="margin:0;font-size:15px;color:#555555;">${tierData.price}</p>
                  </td>
                </tr>
              </table>

              <!-- Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="text-align:center;">
                    <a href="${tierData.badgeUrl}" style="display:inline-block;background-color:#4A70C2;color:#ffffff;font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;">View your badge →</a>
                  </td>
                </tr>
              </table>

              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                If you ever have questions or just want to say hello, you can reach us at <a href="mailto:hero@empowrcic.org" style="color:#4f6ef7;">hero@empowrcic.org</a>.
              </p>
              <p style="font-size:14px;color:#7a7a8a;line-height:1.6;margin:0 0 24px;">
                To manage or cancel your subscription at any time, visit your <a href="${STRIPE_PORTAL_URL}" style="color:#7a7a8a;">Subscriber Portal</a>.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;">
                With gratitude,<br/>
                <strong>The Empowr Team</strong>
              </p>
              ${buildMantraHtml()}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
                Empowr CIC · Registered in England and Wales<br/>
                You're receiving this because you signed up as an Empowr Hero.<br/>
                <a href="https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy" style="color:#999999;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * @param {object} params
 * @param {string} params.name      - Donor full name
 * @param {object} params.tierData  - Tier config object from TIER_CONFIG
 */
function buildEmailText({ name, tierData }) {
  const firstName = name ? name.split(' ')[0] : 'Hero'

  return `Hi ${firstName},

Thank you for becoming an Empowr Hero!

You've joined as a ${tierData.label} (${tierData.price}).

${tierData.desc}

View your ${tierData.label} badge here:
${tierData.badgeUrl}

If you have any questions, reach us at hero@empowrcic.org.

To manage or cancel your subscription at any time:
${STRIPE_PORTAL_URL}

With gratitude,
The Empowr Team

---
Live by growing. Grow by learning. Learn by doing.
Together, we move wellbeing forward — one action at a time.

---
Empowr CIC · Registered in England and Wales
Privacy Policy: https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy`
}

/**
 * @param {object} params
 * @param {string} params.name      - Donor full name
 * @param {string} params.siteUrl   - Live site URL for CTA link
 */
function buildOneTimeEmailHtml({ name, siteUrl }) {
  const firstName = name ? name.split(' ')[0] : 'Friend'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Supporting Empowr</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:40px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;">Thank You for Your Gift 💝</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Hi ${firstName},
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Thank you so much for your generous contribution to Empowr CIC. Every gift — no matter the size — makes a real and immediate difference to the people and communities we work with.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;">
                Your support helps us keep our sessions affordable, accessible, and impactful. We're grateful to have you in our corner.
              </p>

              <!-- Become a Hero card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;font-size:15px;font-weight:800;color:#1a1a2e;">Want to make an even bigger impact? 🦸</p>
                    <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;">Becoming a monthly Hero means your support keeps working every single month — and it comes with some great benefits:</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#333333;">🎖️ <strong>A personalised Hero badge</strong> — to share and wear with pride</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#333333;">📣 <strong>Recognition</strong> in our growing Heroes community</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#333333;">💪 <strong>Sustained impact</strong> — your contribution compounds over time</p>
                    <a href="${siteUrl}/become" style="display:inline-block;background-color:#4A70C2;color:#ffffff;font-size:15px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Become a Hero →</a>
                  </td>
                </tr>
              </table>

              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                If you ever have questions or just want to say hello, you can reach us at <a href="mailto:hero@empowrcic.org" style="color:#4f6ef7;">hero@empowrcic.org</a>.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;">
                With gratitude,<br/>
                <strong>The Empowr Team</strong>
              </p>
              ${buildMantraHtml()}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
                Empowr CIC · Registered in England and Wales<br/>
                You're receiving this because you made a one-time contribution to Empowr CIC.<br/>
                <a href="https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy" style="color:#999999;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * @param {object} params
 * @param {string} params.name      - Donor full name
 * @param {string} params.siteUrl   - Live site URL for CTA link
 */
function buildOneTimeEmailText({ name, siteUrl }) {
  const firstName = name ? name.split(' ')[0] : 'Friend'

  return `Hi ${firstName},

Thank you so much for your generous contribution to Empowr CIC. Every gift — no matter the size — makes a real and immediate difference to the people and communities we work with.

Your support helps us keep our sessions affordable, accessible, and impactful. We're grateful to have you in our corner.

---

Want to make an even bigger impact?

Becoming a monthly Hero means your support keeps working every single month — and it comes with some great benefits:

- A personalised Hero badge to share and wear with pride
- Recognition in our growing Heroes community
- Sustained impact — your contribution compounds over time

Find out more and choose a tier: ${siteUrl}/become

---

If you have any questions, reach us at hero@empowrcic.org.

With gratitude,
The Empowr Team

---
Live by growing. Grow by learning. Learn by doing.
Together, we move wellbeing forward — one action at a time.

---
Empowr CIC · Registered in England and Wales
Privacy Policy: https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy`
}

/**
 * @param {object} params
 * @param {string} params.name           - Donor full name
 * @param {string} params.email          - Donor email address
 * @param {string} params.tierLabel      - Human-readable tier name e.g. "Seed Hero"
 * @param {string} params.amountFormatted - Pre-formatted amount string e.g. "5.00"
 * @param {string} params.currency       - Uppercase currency code e.g. "GBP"
 * @param {string} params.sessionId      - Stripe checkout session ID
 * @param {string} [params.period]       - Amount period label e.g. "/ month" or "(one-time)"
 */
function buildInternalNotificationHtml({ name, email, tierLabel, amountFormatted, currency, sessionId, period = '/ month' }) {
  const currencySymbol = currency === 'GBP' ? '£' : currency + ' '
  const stripeUrl = sessionId
    ? `https://dashboard.stripe.com/${sessionId.startsWith('cs_test_') ? 'test/' : ''}checkout/sessions/${sessionId}`
    : 'https://dashboard.stripe.com/subscriptions'
  const date = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'long', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Empowr Hero</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#4A70C2;padding:24px 40px;">
              <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;">New Empowr Hero</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;width:130px;">Name</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:15px;color:#1B1B1B;font-weight:600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;">Email</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:15px;color:#1B1B1B;"><a href="mailto:${email}" style="color:#4A70C2;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;">Tier</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:15px;color:#1B1B1B;font-weight:600;">${tierLabel}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;">Amount</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:15px;color:#1B1B1B;">${currencySymbol}${amountFormatted} ${period}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;">Date</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e1db;font-size:15px;color:#1B1B1B;">${date}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-size:13px;color:#7a7a8a;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Session</td>
                  <td style="padding:12px 0;font-size:13px;color:#7a7a8a;word-break:break-all;">${sessionId || '—'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:16px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <a href="${stripeUrl}" style="font-size:13px;color:#4A70C2;text-decoration:none;font-weight:600;">View in Stripe Dashboard →</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * @param {object} params
 * @param {string} params.name           - Donor full name
 * @param {string} params.email          - Donor email address
 * @param {string} params.tierLabel      - Human-readable tier name e.g. "Seed Hero"
 * @param {string} params.amountFormatted - Pre-formatted amount string e.g. "5.00"
 * @param {string} params.currency       - Uppercase currency code e.g. "GBP"
 * @param {string} params.sessionId      - Stripe checkout session ID
 * @param {string} [params.period]       - Amount period label e.g. "/ month" or "(one-time)"
 */
function buildInternalNotificationText({ name, email, tierLabel, amountFormatted, currency, sessionId, period = '/ month' }) {
  const currencySymbol = currency === 'GBP' ? '£' : currency + ' '
  const stripeUrl = sessionId
    ? `https://dashboard.stripe.com/${sessionId.startsWith('cs_test_') ? 'test/' : ''}checkout/sessions/${sessionId}`
    : 'https://dashboard.stripe.com/subscriptions'
  const date = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'long', timeStyle: 'short' })

  return `New Empowr Hero

Name:    ${name}
Email:   ${email}
Tier:    ${tierLabel}
Amount:  ${currencySymbol}${amountFormatted} ${period}
Date:    ${date}
Session: ${sessionId || '—'}

View in Stripe Dashboard:
${stripeUrl}`
}

module.exports = { buildEmailHtml, buildEmailText, buildOneTimeEmailHtml, buildOneTimeEmailText, buildInternalNotificationHtml, buildInternalNotificationText }
