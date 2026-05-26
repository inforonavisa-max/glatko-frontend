# SANITY-PREP-1 — Completion Report

**Date:** 2026-05-25
**Branch:** `sanity-prep-1` (worktree `../glatko-sanity-prep-1`, based on `origin/main` @ `dae4524`)
**Goal:** Add the 3 Sanity components CONTENT-ENGINE-1 Phase 2 needs — schema.org type, FAQ block, price table. Additive only, no migration.
**Status:** 3 atomic commits done, each build-verified (`next build` exit 0, no new warnings). **NOT pushed / NO PR / NOT merged** — awaiting Rohat's manual tests + merge go-ahead.

---

## 1. Commits

| # | SHA | Title |
|---|---|---|
| 1 | `62ef666` | add schemaType field + Article/HowTo JSON-LD generators |
| 2 | `7f24bde` | add FAQ block component + FAQPage JSON-LD injection |
| 3 | `811e8a1` | add price table block for cost guides |

Each commit builds independently (verified before committing the next).

## 2. Added fields / components

**Commit 1 — schema type + Article/HowTo JSON-LD**
- `post.schemaType` — dropdown (article / howto / faq / itemlist / service), default `article`. → [post.ts](../../sanity/schemas/documents/post.ts)
- `generateArticleSchema()` + `generateHowToSchema()` (+ `HowToStep`) in [jsonld.ts](../../lib/seo/jsonld.ts)
- `POST_DETAIL_PROJECTION` now fetches `schemaType` + `_updatedAt`; `PostDetail` type updated
- Blog post page emits **Article** JSON-LD, canonical URL via `localizedUrl()` (in lockstep with page canonical/hreflang)

**Commit 2 — FAQ block**
- New `faqBlock` object (heading + 2–20 Q&A items) → [faqBlock.ts](../../sanity/schemas/objects/faqBlock.ts)
- Registered in schema index; embeddable in `localeRichText` body
- `components/blog/FAQBlock.tsx` — accessible accordion render
- Portable Text `faqBlock` type mapping
- Blog page emits **FAQPage** JSON-LD when the body contains FAQ block(s) (reuses existing `generateFAQPageSchema`)

**Commit 3 — price table**
- New `priceTable` object (heading, currency EUR/USD, 2–50 rows of service + low/high price + unit + notes, caption) → [priceTable.ts](../../sanity/schemas/objects/priceTable.ts)
- Registered; embeddable in `localeRichText` body
- `components/blog/PriceTable.tsx` — responsive, horizontally scrollable table
- Portable Text `priceTable` type mapping

## 3. Migration impact

**None.** All changes are additive:
- `schemaType` has `initialValue: "article"` and is read with a fallback — existing posts behave exactly as before (Article schema, which is new-but-safe structured data).
- `faqBlock` / `priceTable` are optional body blocks — existing posts simply don't contain them.
- No field was renamed, retyped, or removed. No content migration required.

## 4. Key design decision (deviation from the sprint template)

The sprint template specified `localeString` / `localeText` for the FAQ and price-table fields. **I used plain `string` / `text` / `number` instead**, because:

- `content` is `localeRichText` = **nine separate per-locale Portable Text arrays** (`content.me`, `content.en`, …). The GROQ projection flattens to the active locale (`"content": content.$$LOCALE$$`).
- A block inside `content.me` is already Montenegrin; its text should be plain, not a 9-locale dict. This is exactly how the **existing image block** stores its `alt` / `caption` (plain strings).
- Using `localeString` would force double-localization (a 9-language sub-form inside each per-locale array) — confusing for editors and inconsistent with the codebase.

Net effect for Phase 2 authoring: add the FAQ/price block **inside each locale's content editor** (ME block in the ME body, EN block in the EN body, …), same as writing the prose.

## 5. Files touched

```
sanity/schemas/documents/post.ts          (M)  schemaType field
sanity/schemas/index.ts                    (M)  register faqBlock, priceTable
sanity/schemas/objects/localeRichText.ts   (M)  embed faqBlock, priceTable
sanity/schemas/objects/faqBlock.ts         (A)
sanity/schemas/objects/priceTable.ts       (A)
lib/seo/jsonld.ts                          (M)  Article + HowTo generators
lib/sanity/queries.ts                      (M)  fetch schemaType + _updatedAt
lib/sanity/types.ts                        (M)  PostDetail.schemaType/updatedAt
components/sanity/PortableText.tsx         (M)  faqBlock + priceTable mapping
components/blog/FAQBlock.tsx               (A)
components/blog/PriceTable.tsx             (A)
app/[locale]/blog/[slug]/page.tsx          (M)  Article + FAQPage JSON-LD
```

No protected files touched (`middleware.ts`, `app/layout.tsx`, `lib/supabase/admin.ts`, env files). `.env.local` was copied into the worktree **for local build only** — it is git-ignored and not committed.

## 6. Manual test checklist (for Rohat — needs Studio + a deploy)

These DoD items require a human + a preview deploy and were not automatable from here:

- [ ] **Sanity Studio:** post editor shows the **Schema.org type** dropdown.
- [ ] **Sanity Studio:** the body editor's insert menu shows **FAQ Block** and **Price Table**.
- [ ] **Test post:** create a post with an FAQ block (3 Qs) + a price table (5 rows); publish.
- [ ] **Preview render:** FAQ accordion + price table display correctly (incl. mobile / RTL for `ar`).
- [ ] **View source / Rich Results Test** (`https://search.google.com/test/rich-results`): **Article** + **FAQPage** detected and valid.
- [ ] **Regression:** existing post `/<locale>/blog/karadagda-yat-temizligi` still renders (h1 + body) and now carries Article JSON-LD.

Quick checks once a preview URL exists:
```bash
curl -s https://<preview>/me/blog/karadagda-yat-temizligi | grep -c 'application/ld+json'  # ≥1 (Article)
```

## 7. Next steps

1. Rohat runs the §6 manual tests on a preview.
2. On "OK": push `sanity-prep-1`, open PR (`sanity-prep-1 → main`), squash-merge **after** approval.
3. Then CONTENT-ENGINE-1 Phase 2 can author the 10 topics (Article/HowTo/FAQPage/ItemList per topic, FAQ blocks on guides, price tables on B1–B3).

> Per sprint rules, no push / PR / merge has been performed. Say the word and I'll push + open the PR.
