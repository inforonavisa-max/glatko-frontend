import { getCliClient } from "sanity/cli";

/**
 * Görev 5 — link the two existing B2 posts as each other's translation, so the
 * blog hreflang builder can emit a correct cross-locale relationship.
 * Idempotent: re-running just re-sets the same single-element arrays.
 * Run: npx sanity exec scripts/add-b2-translations.mjs --with-user-token
 */
const client = getCliClient();

const ME = "post-cijene-vodoinstalatera-elektricara-2026";
const EN = "post-plumber-cost-montenegro-2026";

const meRes = await client
  .patch(ME)
  .set({
    translations: [{ _type: "reference", _ref: EN, _key: "trans-en" }],
  })
  .commit();
console.log("ME patched rev:", meRes._rev);

const enRes = await client
  .patch(EN)
  .set({
    translations: [{ _type: "reference", _ref: ME, _key: "trans-me" }],
  })
  .commit();
console.log("EN patched rev:", enRes._rev);

console.log("LINKED");
