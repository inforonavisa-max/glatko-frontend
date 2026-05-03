/**
 * ICU plural verification for the 3 new keys × 9 langs × multiple counts.
 * Uses next-intl's runtime to format messages exactly like in the app.
 */
import { createTranslator } from "next-intl";
import fs from "fs";

const LANGS = ["ar", "de", "en", "it", "me", "ru", "sr", "tr", "uk"] as const;
const KEYS = ["subtitleDynamic", "allSubheadingDynamic", "viewAllCategories"] as const;
const COUNTS = [0, 1, 2, 4, 5, 11, 14, 21, 100];

const failures: string[] = [];
let renders = 0;

function loadDict(lang: string) {
  return JSON.parse(
    fs.readFileSync(`/Users/Shared/dev/glatko-frontend/dictionaries/${lang}.json`, "utf-8")
  );
}

function makeTranslator(lang: string) {
  const cldrLocale = lang === "me" || lang === "sr" ? "sr-Latn" : lang;
  return createTranslator({ locale: cldrLocale, messages: loadDict(lang) });
}

for (const lang of LANGS) {
  const t = makeTranslator(lang);
  for (const key of KEYS) {
    for (const count of COUNTS) {
      try {
        const out = t(`categories.${key}` as never, { count } as never) as string;
        renders++;
        if (!out || out === `categories.${key}`) {
          failures.push(`${lang}/${key}/count=${count}: empty/unresolved → "${out}"`);
        } else if (out.includes("{count") || out.includes("plural,")) {
          failures.push(`${lang}/${key}/count=${count}: plural not interpreted → "${out.slice(0, 80)}"`);
        }
      } catch (e: unknown) {
        failures.push(`${lang}/${key}/count=${count}: THREW ${(e as Error).message}`);
      }
    }
  }
}

console.log("=== Sample renders (count=14) ===");
for (const lang of LANGS) {
  const t = makeTranslator(lang);
  for (const key of KEYS) {
    const out = t(`categories.${key}` as never, { count: 14 } as never) as string;
    console.log(`  [${lang}] ${key}: ${out}`);
  }
  console.log("");
}

console.log("=== RU plural categories (allSubheadingDynamic) ===");
{
  const t = makeTranslator("ru");
  for (const c of [1, 2, 4, 5, 11, 14, 21]) {
    const out = t("categories.allSubheadingDynamic" as never, { count: c } as never) as string;
    console.log(`  count=${c}: ${out}`);
  }
}

console.log("\n=== UK plural categories ===");
{
  const t = makeTranslator("uk");
  for (const c of [1, 2, 4, 5, 11, 14, 21]) {
    const out = t("categories.allSubheadingDynamic" as never, { count: c } as never) as string;
    console.log(`  count=${c}: ${out}`);
  }
}

console.log("\n=== SR (BCMS) plural categories ===");
{
  const t = makeTranslator("sr");
  for (const c of [1, 2, 4, 5, 11, 14, 21]) {
    const out = t("categories.allSubheadingDynamic" as never, { count: c } as never) as string;
    console.log(`  count=${c}: ${out}`);
  }
}

console.log("\n=== ME plural categories ===");
{
  const t = makeTranslator("me");
  for (const c of [1, 2, 4, 5, 11, 14, 21]) {
    const out = t("categories.allSubheadingDynamic" as never, { count: c } as never) as string;
    console.log(`  count=${c}: ${out}`);
  }
}

console.log("\n=== AR plural categories ===");
{
  const t = makeTranslator("ar");
  for (const c of [0, 1, 2, 5, 11, 14, 100]) {
    const out = t("categories.allSubheadingDynamic" as never, { count: c } as never) as string;
    console.log(`  count=${c}: ${out}`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total renders: ${renders}/${LANGS.length * KEYS.length * COUNTS.length}`);
console.log(`Failures: ${failures.length}`);
if (failures.length > 0) {
  console.log("\nFailure details:");
  failures.forEach((f) => console.log("  ❌", f));
  process.exit(1);
}
console.log("✅ All renders succeeded with valid output");
