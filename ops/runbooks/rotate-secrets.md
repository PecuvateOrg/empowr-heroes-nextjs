# Runbook: Rotate API Keys / Secrets

Use this when any API key needs to be replaced — expired, compromised, or migrated.

---

## Environment variables in use

| Variable | Service | Where to get a new value |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Stripe dashboard → Webhooks → signing secret |
| `RESEND_API_KEY` | Resend | Resend dashboard → API Keys |
| `NOTION_API_KEY` | Notion | Notion → Settings → Connections → integration token |
| `NOTION_DATABASE_ID` | Notion | From the Notion database URL (32-char ID) |
| `SITE_URL` | Site | `https://hero.empowrcic.org` (only change if domain changes) |

---

## Steps

### 1. Generate the new key in the relevant dashboard

Do not revoke the old key yet.

### 2. Update `.env.local` for local testing

```
VARIABLE_NAME=new-value
```

### 3. Test locally

For Stripe webhook secrets: run `npm run dev:netlify` and `npm run dev:stripe` and trigger a test event. Verify the webhook processes correctly.

### 4. Update in Netlify

Netlify dashboard → Site → Site configuration → Environment variables → find the variable → edit value.

Netlify will not automatically redeploy after an env var change. Trigger a manual redeploy or push a commit to `main`.

### 5. Revoke the old key

Only after confirming the new key works in production.

### 6. Update `DEVLOG.md` (in the private hub)

Note the rotation date and reason.
