/**
 * core/email-template.js
 *
 * Builds the HTML and plain text bodies for the donor welcome email.
 * Separated from donation-handler.js so the template can be updated
 * independently of the handler logic.
 *
 * Both functions receive { name, tier, siteUrl, tierData } and return a string.
 */

/**
 * @param {object} params
 * @param {string} params.name      - Donor full name
 * @param {string} params.tier      - Tier key e.g. "community"
 * @param {string} params.siteUrl   - Live site URL for badge image URLs
 * @param {object} params.tierData  - Tier config object from TIER_CONFIG
 */
function buildEmailHtml({ name, tier, siteUrl, tierData }) {
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
              <img src="${siteUrl}/badges/${tierData.badge}" alt="${tierData.label} Badge" width="100" style="display:block;margin:0 auto 16px;" />
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;">You're an Empowr Hero ${tierData.emoji}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Hi ${firstName},
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Thank you so much for becoming an <strong>Empowr Hero</strong>. Your support means the world to us and to every young person whose life is shaped by the sessions you're helping to make possible.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;">
                You've joined as a <strong>${tierData.label}</strong> — ${tierData.desc}
              </p>

              <!-- Tier card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Your Hero Tier</p>
                    <p style="margin:0;font-size:22px;font-weight:800;color:#1a1a2e;">${tierData.emoji} ${tierData.label}</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#555555;">${tierData.price}</p>
                  </td>
                </tr>
              </table>

              <!-- Badge notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e8e8e8;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:15px;color:#333333;line-height:1.6;">
                      <strong>Your Hero Badge</strong><br/>
                      Your ${tierData.label} badge is included above. You're welcome to use it to show your support for the Empowr Heroes Programme.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                If you ever have questions or just want to say hello, you can reach us at <a href="mailto:hero@empowrcic.org" style="color:#4f6ef7;">hero@empowrcic.org</a>.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0;">
                With gratitude,<br/>
                <strong>The Empowr Team</strong>
              </p>
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
 * @param {string} params.tier      - Tier key e.g. "community"
 * @param {object} params.tierData  - Tier config object from TIER_CONFIG
 */
function buildEmailText({ name, tier, tierData }) {
  const firstName = name ? name.split(' ')[0] : 'Hero'

  return `Hi ${firstName},

Thank you for becoming an Empowr Hero!

You've joined as a ${tierData.label} (${tierData.price}).

${tierData.desc}

Your Hero badge has been included in the HTML version of this email.

If you have any questions, reach us at hero@empowrcic.org.

With gratitude,
The Empowr Team

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
                Thank you so much for your generous contribution to Empowr CIC. Every gift — no matter the size — makes a real and immediate difference to the young people we work with.
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
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0;">
                With gratitude,<br/>
                <strong>The Empowr Team</strong>
              </p>
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

Thank you so much for your generous contribution to Empowr CIC. Every gift — no matter the size — makes a real and immediate difference to the young people we work with.

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
Empowr CIC · Registered in England and Wales
Privacy Policy: https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy`
}

module.exports = { buildEmailHtml, buildEmailText, buildOneTimeEmailHtml, buildOneTimeEmailText }
