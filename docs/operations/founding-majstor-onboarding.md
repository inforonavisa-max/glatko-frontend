# Founding Majstor Onboarding — Manual Pattern

This is the runbook Helena (or whoever) follows to onboard a "founding"
service provider when the public Pro Wizard is broken or pre-launch.

The process produces the same DB state the wizard would, by hand, atomically.

> **Scope:** Glatko production only (Supabase ref `cjqappdfyxgytdyeytwv`).
> Do NOT run this against Fijaka or RoNa Legal.

---

## When to use this

- Wizard got stuck and the majstor can't finish signup.
- Onboarding before public launch (May 13–14 2026), where we hand-pick the
  first 10–15 majstors so search results aren't empty on day one.
- "Concierge" onboarding — Helena collects details over WhatsApp/phone
  and we promise the majstor we'll set them up.

For anything beyond #14 we should build the admin "Create provider" UI
(out of scope for this doc).

---

## What the majstor needs to have done first

1. **Created an account.** They open `/register`, fill the form, click the
   email verification link. After this they have a row in
   `auth.users` and a row in `profiles`.
2. **Sent us their info.** Bare minimum: business name, phone, city,
   primary service category. Nice-to-haves below.

If they tried the Pro Wizard and got stuck, that's fine — there will be a
`profiles` row and (probably) NO `glatko_professional_profiles` row.

---

## Required vs nice-to-have

| Field | Required | Notes |
|---|---|---|
| `user_id` (auth UID) | ✅ | Find in Supabase Auth tab. |
| `expected_email` | ✅ | Must match `profiles.email`; guard aborts if not. |
| `business_name` | ✅ | Trading name; falls back to full name if no separate brand. |
| `slug` | ✅ | Lowercase + ASCII-fold + kebab-case of `business_name`. |
| `phone` | ✅ | International format `+382 XX XXX XXX`. |
| `location_city` | ✅ | Lowercase city slug (`podgorica`, `herceg-novi`, …). |
| `primary_category_id` | ✅ | One UUID from `glatko_service_categories`. |
| `founding_number` | ✅ | Next free; query: `SELECT COALESCE(MAX(founding_provider_number),0)+1 FROM glatko_professional_profiles;` |
| `bio` | ⚪ | Free-form. ME/SR/EN OK. Empty string allowed but discouraged. |
| `years_experience` | ⚪ | Integer or NULL. `0` means "started this year". |
| `languages` | ⚪ | `text[]`; default `ARRAY['me','sr']::text[]`. Add `'en'` for tourist-facing trades. |
| `service_radius_km` | ⚪ | Int. Defaults: 25 (city-only), 50 (region), 200 (whole country). |
| `secondary_category_ids` | ⚪ | Additional service categories the majstor handles. |
| `hourly_rate_min` / `_max` | ⚪ | Numeric. Skip if rates are job-based. |
| Avatar photo | ⚪ but high-impact | Single JPEG, ≤5 MB. |
| Portfolio photos | ⚪ but high-impact | Up to 10 JPEGs at ≤10 MB each. |
| Insurance / certificates | ⚪ | If majstor has docs, upload to `pro-documents` (private) and use the `tier_documents` jsonb. |

---

## Step-by-step checklist

### 1. Find the majstor's UID and email

Open the Glatko Supabase dashboard → **Authentication** → search by email.
Copy the User UID (UUID).

### 2. Confirm their `profiles` row state

In SQL editor:

```sql
SELECT id, email, full_name, phone, city, role, is_active
FROM profiles
WHERE id = '<user_id>';
```

Expect: 1 row, role `'user'`, `is_active=true`.

### 3. Confirm they don't already have a pro profile

```sql
SELECT id, business_name, slug, founding_provider_number
FROM glatko_professional_profiles
WHERE id = '<user_id>';
```

Expect: 0 rows. If 1 row, **stop** — that majstor is already onboarded.

### 4. Find the next founding number

```sql
SELECT COALESCE(MAX(founding_provider_number), 0) + 1 AS next_number
FROM glatko_professional_profiles;
```

### 5. Look up the right service category UUIDs

For Helena's stated trade (e.g. "moving / transport"):

```sql
SELECT id, slug, parent_id, name->>'me' AS name_me, name->>'tr' AS name_tr
FROM glatko_service_categories
WHERE name::text ILIKE '%<keyword>%' OR slug ILIKE '%<keyword>%'
ORDER BY parent_id NULLS FIRST, slug;
```

Pick **one** primary (most specific) and zero-or-more secondaries.

### 6. Open the template SQL

Open [`founding-majstor-template.sql`](./founding-majstor-template.sql).
Copy the whole file into a new Supabase SQL editor tab.

### 7. Replace every `{{placeholder}}`

Find/replace each `{{...}}` with the value from Helena's data sheet.
Pay attention to:

- `{{bio}}` is wrapped in single quotes by the template; if the bio
  contains an apostrophe, double it (`'` → `''`) inside the value.
- `{{location_city}}` is the lowercase slug; `{{location_city_display}}`
  is the Title-Cased version that goes into `profiles.city`.
- `{{languages}}` must be the full SQL expression
  (`ARRAY['me','sr']::text[]`), not just `me,sr`.

### 8. Run the SQL

Click **Run**. Expected outcome: **"Success. No rows returned"**.

If a guard fires (`RAISE EXCEPTION`), the transaction rolls back and
nothing is inserted. Read the error, fix the underlying issue (wrong
email? founding number already taken?), and re-run.

### 9. Run the verification SELECTs (B1–B4)

The template has them at the bottom, commented out. Uncomment / paste
into a new tab. Each one should match expectations:

| | Expectation |
|---|---|
| B1 | 1 row matching the values you filled in |
| B2 | N rows (= number of categories), exactly 1 with `is_primary=true` |
| B3 | `phone` and `city` populated, `role` still `'user'` |
| B4 | `founding_provider_number` sequence has no gaps, ends with the new majstor |

### 10. Upload photos (if Helena has them)

a. Navigate Storage → `avatars` bucket → **Create folder** named
   `<user_id>` → **Upload files** → pick one image, name it `avatar.jpg`.
b. Storage → `pro-portfolio` → **Create folder** named `<user_id>` →
   **Upload files** → pick the portfolio images, names them
   `portfolio-1.jpg`, `portfolio-2.jpg`, …
c. Verify each public URL with `curl -I`:
   ```
   curl -I "https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/avatars/<user_id>/avatar.jpg"
   ```
   Expect `HTTP/2 200`.
d. Run the photo-update block at the bottom of the template SQL
   (uncomment, fill `{{user_id}}` and the portfolio count, run).

---

## Diagnosing a stuck wizard

If a majstor reports "I clicked submit and nothing happened", before
manually onboarding, ask Helena to find out:

1. **Which step did it freeze on?** (1: profile basics, 2: services,
   3: photos.) Step 2 is the most common — it indicates the category
   tree didn't render their root.
2. **Did they have any photos to upload?** Some wizard versions silently
   fail on >5 MB or HEIC files.
3. **City spelled how?** If they typed something not in the autocomplete,
   the form sometimes can't submit.

If it's step 2, prefer onboarding manually — wizard category-tree bug
fixes ship in a separate sprint.

---

## Post-launch activation

The current pattern sets `is_active = true` at insert (matches founding
pros #1–#10). If we later move to "draft on insert, activate on launch
day", change the template to `is_active = false` and add a one-shot
SQL to flip everyone live on launch day.

---

## What NOT to do

- Don't promote `profiles.role` to `'professional'` — existing founding
  pros stay `'user'`. The `glatko_professional_profiles` row is the
  authoritative pro link.
- Don't insert into `glatko_customer_profiles` from this template;
  that's for the customer side. (If a majstor also wants to book
  services, that's a separate row, not bundled here.)
- Don't skip the guards. Race-condition aborts cost nothing; missed
  duplicate inserts cost an embarrassing rollback.
- Don't share Storage URLs from the **private** buckets (`pro-documents`).
  Only `avatars` and `pro-portfolio` are public.

---

## Reference: precedent founding pros (1–10, May 2026)

| # | slug | city | primary category |
|---|---|---|---|
| 1 | ottowin | podgorica | renovation-construction |
| 2 | ela-hilal-pastaci | budva | catering-food |
| 3 | nana-painter | kotor | painter |
| 4 | elektroexpert | podgorica | (electrician) |
| 5 | tobefit-pilates-studio | budva | nutrition-diet |
| 6 | zeze | budva | babysitter |
| 7 | yat-yap | kotor | hull-cleaning |
| 8 | cleaning-service-morija | bar | regular-cleaning |
| 9 | dyt-seren-hilalogullari-… | budva | nutrition-diet |
| 10 | milos-golubovic | herceg-novi | home-moving |

All `verification_status='approved'`, `verification_tier='basic'`,
`is_active=true`, `is_founding_provider=true`.
