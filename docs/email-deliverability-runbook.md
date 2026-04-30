# Glatko Email Deliverability Runbook

Operational guide for the Glatko transactional email pipeline (Supabase Send
Email Hook → Vercel `/api/auth/email-hook` → Resend → end user).

## Domain Warm-up Strategy

`glatko.app` was added to Resend on 2026-04-06 (eu-west-1). Gmail, Outlook,
and Apple Mail score new sending domains conservatively — sudden volume
spikes are the single biggest reason transactional mail lands in spam.

### Week 1 (days 1–7) — Soft start

- **Daily volume**: ≤50 emails
- **Recipients**: only test accounts and early-pro invitees (≤20 unique)
- **Monitor daily**: Postmaster Tools spam rate (target <0.1%), Resend
  delivered rate (≥99%), mail-tester score (≥9/10)

### Week 2–3 (days 8–21) — Ramp

- **Daily volume**: ≤200 emails
- **Recipients**: real signup confirmations, password resets, magic links
- **Monitor**: bounce rate <2%, complaint rate <0.1%

### Week 4+ (day 22+) — Steady state

- **Daily volume**: organic (auth events scale)
- All five email types live (signup, recovery, magiclink, email_change,
  reauthentication)
- Monitoring cadence: daily → weekly

## Metrics to Monitor

### Daily (first 30 days)

- mail-tester.com score: ≥9/10
- Gmail Postmaster Tools: spam rate <0.1%
- Resend dashboard delivery rate: ≥98%
- Bounce rate: <2%

### Weekly

- Domain reputation trend (Postmaster: High / Medium / Low / Bad)
- IP reputation (Postmaster, EU west AWS SES IPs from Resend)
- Authentication PASS rate (DKIM/SPF/DMARC) — target 100%

### Monthly

- Inbox-placement test (`mail-tester.com` or comparable)
- Apple Privacy Protection compatibility check

## Endpoints

| Endpoint | Purpose | Auth |
|---|---|---|
| `GET /api/auth/email-hook` | Health check | none |
| `POST /api/auth/email-hook` | Supabase Auth Hook receiver | `webhook-signature` (Supabase) |
| `GET /api/webhooks/resend` | Health check | none |
| `POST /api/webhooks/resend` | Resend event receiver | `svix-signature` (Resend) |
| `GET /api/admin/email-stats?days=N` | Aggregate event counts/rates | `Authorization: Bearer ADMIN_API_KEY` |

## Red Flags (action required)

1. **Spam rate >0.3%** → freeze non-essential email volume, audit content
2. **Bounce rate >5%** → audit email validation, run list cleanup
3. **DMARC failures** → re-verify `_dmarc.glatko.app`, `resend._domainkey.glatko.app`, `send.glatko.app` SPF
4. **Domain reputation: Bad** → 1-week cool-down, then root-cause investigation

## Emergency Procedures

### Domain blacklisted

1. Check Spamhaus: https://www.spamhaus.org/lookup/
2. Pull last 7 days of `email_events` (look for clusters of `complained` or hard `bounced`)
3. Open Resend support ticket with the recipient samples and DKIM/SPF/DMARC `dig` output
4. Re-verify DNS records — every record listed in the table below

### Hook fails

1. Vercel logs: filter on `/api/auth/email-hook`
2. Supabase Auth logs (Dashboard → Logs → Auth)
3. Fallback: temporarily disable the hook in Supabase Dashboard → Auth → Hooks. Supabase reverts to its built-in (English-only) templates so users keep getting mail while we debug.
4. Ship fix, re-enable.

## DNS Records (production)

| Record | Type | Value/Pattern | Purpose |
|---|---|---|---|
| `glatko.app` | TXT | `google-site-verification=...` | Postmaster Tools |
| `_dmarc.glatko.app` | TXT | `v=DMARC1; p=quarantine; rua=mailto:dmarc@glatko.app; pct=100; adkim=r; aspf=r` | DMARC policy |
| `send.glatko.app` | TXT | `v=spf1 include:amazonses.com ~all` | SPF for Resend bounce domain |
| `resend._domainkey.glatko.app` | TXT | `p=...` (DKIM public key) | Resend DKIM signature |
| `glatko.app` | MX | `1 smtp.google.com.` | Inbound (Google Workspace) |
| `send.glatko.app` | MX | `10 feedback-smtp.eu-west-1.amazonses.com.` | Bounce return-path |

## Email Audit Log

| Date | Action | Result |
|---|---|---|
| 2026-04-06 | Initial Resend setup | Verified, eu-west-1 |
| 2026-04-30 | DMARC TXT added | Propagated |
| 2026-04-30 | Send Email Hook live (preview) | E2E delivered (Karadağca, in spam) |
| 2026-04-30 | G-AUTH-3 shipped to production | Hook URL → glatko.app |
| 2026-04-30 | G-DELIVERABILITY-1 | brand-prefixed subjects + List-Unsubscribe + bounce webhook + Postmaster setup + warm-up plan |
