/**
 * Idempotent FAQ-data runner. Scans every migration under `supabase/migrations/`
 * for `UPDATE public.glatko_service_categories SET faqs = '[...]'::jsonb WHERE
 * slug = '...'` blocks, parses out the JSONB literal, and pushes it via
 * supabase-js with the service-role key.
 *
 * The DDL portion of each migration (e.g. `ALTER TABLE ... ADD COLUMN faqs`)
 * still needs to be applied via the Supabase Dashboard SQL Editor first —
 * supabase-js cannot run DDL through PostgREST. After that one-time setup
 * this script can be re-run safely; UPDATEs are idempotent.
 *
 * Run with:  npx tsx scripts/apply-category-faqs.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { readFileSync, readdirSync } from "fs";
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

const MIG_DIR = join(process.cwd(), "supabase/migrations");

interface FaqUpdate {
  slug: string;
  faqs: unknown[];
  source: string; // migration filename
}

/**
 * Walks the SQL string and yields every `UPDATE … SET faqs = '…'::jsonb
 * WHERE slug = '…';` block. The block-by-block split avoids the greedy-regex
 * bug where one UPDATE's content could swallow a neighbour's slug match.
 */
function extractFaqUpdates(sql: string, source: string): FaqUpdate[] {
  const blocks = sql
    .split(/UPDATE public\.glatko_service_categories\s+SET faqs = '/)
    .slice(1);
  const out: FaqUpdate[] = [];
  for (const block of blocks) {
    const m = block.match(
      /^([\s\S]+?)'::jsonb\s+WHERE slug = '([a-z0-9-]+)';/m,
    );
    if (!m) continue;
    const [, rawJson, slug] = m;
    const jsonText = rawJson.replace(/''/g, "'");
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error(`JSON parse failed for ${slug} in ${source}:`, err);
      console.error("First 200 chars:", jsonText.slice(0, 200));
      throw err;
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`${slug} in ${source}: faqs literal is not an array`);
    }
    out.push({ slug, faqs: parsed, source });
  }
  return out;
}

async function main() {
  // Discover all migrations and gather updates in filename order so later
  // migrations win for the same slug (last-write-wins).
  const files = readdirSync(MIG_DIR)
    .filter((f) => /^0\d+_glatko_category_faqs.*\.sql$/.test(f))
    .sort();
  if (files.length === 0) {
    console.error(`No FAQ migration files matched in ${MIG_DIR}`);
    process.exit(1);
  }
  console.log(`Scanning ${files.length} FAQ migration(s):`, files.join(", "));

  const allUpdates: FaqUpdate[] = [];
  for (const f of files) {
    const sql = readFileSync(join(MIG_DIR, f), "utf8");
    const updates = extractFaqUpdates(sql, f);
    allUpdates.push(...updates);
  }
  // Last-write-wins on duplicate slugs across files.
  const bySlug = new Map<string, FaqUpdate>();
  for (const u of allUpdates) bySlug.set(u.slug, u);
  const final = Array.from(bySlug.values());
  console.log(
    `Found ${allUpdates.length} UPDATE block(s); applying ${final.length} unique slug(s).`,
  );

  // Sanity: column exists?
  const probeSlug = final[0]?.slug;
  if (!probeSlug) {
    console.error("No UPDATE blocks parsed; aborting.");
    process.exit(1);
  }
  const { error: probeErr } = await supabase
    .from("glatko_service_categories")
    .select("slug, faqs")
    .eq("slug", probeSlug)
    .single();
  if (probeErr) {
    console.error(
      "Probe failed — has the ALTER TABLE for `faqs` column been applied yet?",
    );
    console.error(probeErr);
    process.exit(1);
  }

  for (const u of final) {
    const { error, data } = await supabase
      .from("glatko_service_categories")
      .update({ faqs: u.faqs })
      .eq("slug", u.slug)
      .select("slug");

    if (error) {
      console.error(`${u.slug}: UPDATE failed`, error);
      process.exit(1);
    }
    console.log(
      `✓ ${u.slug.padEnd(30)} ${u.faqs.length} FAQs applied (rows=${data?.length ?? 0}, source=${u.source})`,
    );
  }

  // Verify final state
  const slugs = final.map((u) => u.slug);
  const { data: verifyRows, error: verifyErr } = await supabase
    .from("glatko_service_categories")
    .select("slug, faqs")
    .in("slug", slugs);
  if (verifyErr) {
    console.error("Verify failed:", verifyErr);
    process.exit(1);
  }
  console.log("\nVerify:");
  for (const row of verifyRows ?? []) {
    const arr = row.faqs as unknown[];
    console.log(
      `  ${(row.slug as string).padEnd(30)} ${Array.isArray(arr) ? arr.length : "?"} FAQs`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
