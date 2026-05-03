/**
 * G-SEO-FOUNDATION migration 042 runner: applies the FAQ seed data for the
 * 4 P0 categories. Run AFTER the ALTER TABLE has been applied via the
 * Supabase Dashboard SQL Editor (or earlier idempotent run).
 *
 * The migration file is the source of truth. This runner parses out each
 * UPDATE block's JSONB literal, undoes SQL single-quote escaping, and pushes
 * via supabase-js with the service-role key.
 *
 * Run with:  npx tsx scripts/apply-category-faqs.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase URL/service role key missing in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MIG_PATH = join(
  process.cwd(),
  "supabase/migrations/042_glatko_category_faqs.sql",
);

const SLUGS = [
  "boat-services",
  "home-cleaning",
  "renovation-construction",
  "beauty-wellness",
] as const;

function extractFaqsJson(sql: string, slug: string): unknown {
  // Split by UPDATE markers so each block is isolated; the previous greedy
  // regex was reaching back through earlier UPDATEs to find the slug match.
  const blocks = sql
    .split(/UPDATE public\.glatko_service_categories\s+SET faqs = '/)
    .slice(1); // first split element is the prologue (ALTER TABLE etc.)
  for (const block of blocks) {
    const blockRe = new RegExp(
      `^([\\s\\S]+?)'::jsonb\\s+WHERE slug = '${slug}';`,
      "m",
    );
    const m = block.match(blockRe);
    if (!m) continue;
    const jsonText = m[1].replace(/''/g, "'");
    try {
      return JSON.parse(jsonText);
    } catch (err) {
      console.error(`JSON parse failed for ${slug}:`, err);
      console.error("First 200 chars:", jsonText.slice(0, 200));
      throw err;
    }
  }
  throw new Error(`No UPDATE block found for slug "${slug}"`);
}

async function main() {
  const sql = readFileSync(MIG_PATH, "utf8");

  // Sanity: ensure column exists by reading one row
  const { data: probe, error: probeErr } = await supabase
    .from("glatko_service_categories")
    .select("slug, faqs")
    .eq("slug", "boat-services")
    .single();
  if (probeErr) {
    console.error(
      "Probe failed — has the ALTER TABLE for `faqs` column been applied yet?",
    );
    console.error(probeErr);
    process.exit(1);
  }
  console.log(`Probe OK. Current boat-services faqs length:`, Array.isArray(probe?.faqs) ? probe.faqs.length : "not-array");

  for (const slug of SLUGS) {
    const faqs = extractFaqsJson(sql, slug) as unknown[];
    if (!Array.isArray(faqs)) {
      console.error(`${slug}: not an array, got`, typeof faqs);
      process.exit(1);
    }
    const { error, data } = await supabase
      .from("glatko_service_categories")
      .update({ faqs })
      .eq("slug", slug)
      .select("slug");

    if (error) {
      console.error(`${slug}: UPDATE failed`, error);
      process.exit(1);
    }
    console.log(`✓ ${slug}: ${faqs.length} FAQs applied (rows=${data?.length ?? 0})`);
  }

  // Verify final state
  const { data: verifyRows, error: verifyErr } = await supabase
    .from("glatko_service_categories")
    .select("slug, faqs")
    .in("slug", [...SLUGS]);
  if (verifyErr) {
    console.error("Verify failed:", verifyErr);
    process.exit(1);
  }
  console.log("\nVerify:");
  for (const row of verifyRows ?? []) {
    const arr = row.faqs as unknown[];
    console.log(`  ${row.slug}: ${Array.isArray(arr) ? arr.length : "?"} FAQs`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
