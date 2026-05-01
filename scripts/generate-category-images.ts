/**
 * G-CAT-2-IMG: Replicate FLUX 1.1 Pro ile 20 kategori görseli üret.
 *
 * Output: public/categories/{slug}.webp (1200×900 cover, ~85 q WebP)
 * DB:     glatko_service_categories.hero_image_url updated
 *
 * Run with:  npx tsx scripts/generate-category-images.ts
 *
 * Env required:
 *   REPLICATE_API_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import Replicate from "replicate";
import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!REPLICATE_API_TOKEN) {
  console.error("REPLICATE_API_TOKEN missing in .env.local");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase URL/service role key missing in .env.local");
  process.exit(1);
}

const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CategoryImage {
  slug: string;
  prompt: string;
}

// 20 kategori — vibrant lifestyle, Boka Bay vibe.
// Slugs verified against glatko_service_categories DB.
const CATEGORIES: CategoryImage[] = [
  // ── 10 root ────────────────────────────────────────────────────────────
  {
    slug: "boat-services",
    prompt:
      "professional boat technician working on luxury yacht in Boka Bay marina, golden hour natural light, deep blue Mediterranean water, mountains in background, photorealistic, vibrant colors, professional photography, shot on Canon R5",
  },
  {
    slug: "home-cleaning",
    prompt:
      "professional cleaner in modern luxury Mediterranean apartment, sunlit room with sea view, neat and crisp, smiling person in clean uniform, high ceilings, natural daylight, photorealistic lifestyle photography",
  },
  {
    slug: "beauty-wellness",
    prompt:
      "serene spa atmosphere in Mediterranean villa, professional therapist applying beauty treatment, candle-lit warm tones, white linen, fresh flowers, ocean view in background, lifestyle photography",
  },
  {
    slug: "renovation-construction",
    prompt:
      "craftsman renovating Mediterranean stone villa, bright daylight, traditional architecture meets modern tools, professional contractor with safety gear, Adriatic coast setting, lifestyle documentary photography",
  },
  {
    slug: "catering-food",
    prompt:
      "private chef preparing Mediterranean feast on yacht deck overlooking Boka Bay, fresh seafood and local ingredients, sunset golden hour, elegant table setting, lifestyle photography",
  },
  {
    slug: "tutoring-education",
    prompt:
      "private tutor and student studying together in bright Mediterranean home library, books and laptop, warm afternoon light, focused learning atmosphere, lifestyle photography",
  },
  {
    slug: "childcare-family",
    prompt:
      "professional nanny playing with happy child in sunny Mediterranean garden, fruit trees and flowers, warm natural light, joyful candid moment, lifestyle photography",
  },
  {
    slug: "moving-transport",
    prompt:
      "professional movers carefully loading furniture from coastal Mediterranean home to van, teamwork, bright morning light, scenic Boka Bay backdrop, lifestyle documentary photography",
  },
  {
    slug: "automotive",
    prompt:
      "mechanic working on luxury car in clean modern workshop, professional tools, bright LED lighting, focused craftsmanship, Mediterranean garage setting, lifestyle photography",
  },
  {
    slug: "airbnb-management",
    prompt:
      "property manager preparing luxury Mediterranean villa for guests, fresh linens, fruit basket, ocean view from balcony, golden afternoon light, lifestyle hospitality photography",
  },

  // ── 10 popular sub ─────────────────────────────────────────────────────
  {
    slug: "antifouling",
    prompt:
      "specialist applying antifouling paint to luxury yacht hull in dry dock, Adriatic shipyard setting, focused craftsmanship, professional marine industry photography",
  },
  {
    slug: "hull-cleaning",
    prompt:
      "professional diver cleaning yacht hull underwater in clear Mediterranean sea, bubbles and sunlight rays, marine industry photography",
  },
  {
    slug: "winter-storage",
    prompt:
      "marine technician winterizing yacht engine in autumn marina, Boka Bay mountains in background, focused professional work, golden afternoon light",
  },
  {
    slug: "boat-engine-service",
    prompt:
      "marine engineer servicing yacht engine in immaculate engine room, professional tools, focused expert work, marine industry documentary photography",
  },
  {
    slug: "deep-cleaning",
    prompt:
      "professional deep cleaning team transforming Mediterranean villa interior, dramatic clean and sparkling surfaces, bright natural light, lifestyle photography",
  },
  {
    slug: "turnover-cleaning",
    prompt:
      "turnover cleaning team preparing vacation rental for next guests, fresh linens and amenities, sunny Mediterranean apartment, hospitality lifestyle photography",
  },
  {
    slug: "hair-salon",
    prompt:
      "professional hair stylist working on client in elegant Mediterranean salon, natural light, sea view through window, lifestyle beauty photography",
  },
  {
    slug: "manicure-pedicure",
    prompt:
      "manicurist creating beautiful nail design in bright Mediterranean nail salon, professional tools, lifestyle beauty photography",
  },
  {
    slug: "boutique-events",
    prompt:
      "private chef serving multi-course dinner on luxury yacht in Boka Bay, sunset, elegant guests, candle light, hospitality lifestyle photography",
  },
  {
    slug: "electrical",
    prompt:
      "professional electrician installing modern lighting in luxury Mediterranean villa, focused work, daylight, lifestyle documentary photography",
  },
];

const OUTPUT_DIR = join(process.cwd(), "public", "categories");

async function generateImage(
  category: CategoryImage,
): Promise<string | null> {
  console.log(`[${category.slug}] Generating...`);
  try {
    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt: category.prompt,
        aspect_ratio: "4:3",
        output_format: "png",
        output_quality: 95,
        safety_tolerance: 2,
      },
    });

    // Replicate v1.x returns FileOutput | FileOutput[] — coerce to URL string.
    const out: unknown = Array.isArray(output) ? output[0] : output;
    let imageUrl: string | null = null;
    if (typeof out === "string") {
      imageUrl = out;
    } else if (
      out &&
      typeof out === "object" &&
      typeof (out as { url?: () => URL }).url === "function"
    ) {
      imageUrl = (out as { url: () => URL }).url().toString();
    }
    if (!imageUrl) {
      throw new Error(`Unexpected output shape: ${JSON.stringify(out).slice(0, 100)}`);
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`fetch ${imageUrl} → ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const optimized = await sharp(buffer)
      .resize(1200, 900, { fit: "cover" })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    const filepath = join(OUTPUT_DIR, `${category.slug}.webp`);
    writeFileSync(filepath, optimized);

    const sizeMB = (optimized.length / 1024 / 1024).toFixed(2);
    console.log(`[${category.slug}] ✅ ${sizeMB} MB → ${filepath}`);

    return `/categories/${category.slug}.webp`;
  } catch (err) {
    console.error(
      `[${category.slug}] ❌ FAILED:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

async function updateDatabase(
  rows: { slug: string; image_url: string }[],
): Promise<void> {
  for (const r of rows) {
    const { error } = await supabase
      .from("glatko_service_categories")
      .update({ hero_image_url: r.image_url })
      .eq("slug", r.slug);
    if (error) {
      console.error(`[DB] ❌ ${r.slug}: ${error.message}`);
    } else {
      console.log(`[DB] ✅ ${r.slug} → ${r.image_url}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateWithRetry(
  category: CategoryImage,
  maxAttempts = 3,
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await generateImage(category);
    if (result) return result;
    if (attempt < maxAttempts) {
      const waitS = 15 * attempt;
      console.log(`[${category.slug}] retry ${attempt + 1}/${maxAttempts} in ${waitS}s…`);
      await sleep(waitS * 1000);
    }
  }
  return null;
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `Generating ${CATEGORIES.length} category images via Replicate FLUX 1.1 Pro...`,
  );

  // Replicate throttles to 6/min, burst 1, while balance < $5.0.
  // Serial loop with 11s spacing = ~5.5 req/min, safely under the limit.
  // Skip categories that already produced an image (resume after partial run).
  const successes: { slug: string; image_url: string }[] = [];
  const SPACING_MS = 11_000;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const filepath = join(OUTPUT_DIR, `${cat.slug}.webp`);
    if (existsSync(filepath)) {
      console.log(`[${cat.slug}] already exists — skipping`);
      successes.push({ slug: cat.slug, image_url: `/categories/${cat.slug}.webp` });
      continue;
    }

    console.log(`\n── ${i + 1}/${CATEGORIES.length}: ${cat.slug} ──`);
    const url = await generateWithRetry(cat);
    if (url) {
      successes.push({ slug: cat.slug, image_url: url });
    }
    if (i < CATEGORIES.length - 1) {
      await sleep(SPACING_MS);
    }
  }

  console.log(
    `\n📦 Generated ${successes.length}/${CATEGORIES.length} images`,
  );

  if (successes.length > 0) {
    console.log("\n🗄️ Updating glatko_service_categories.hero_image_url...");
    await updateDatabase(successes);
  }

  const failed = CATEGORIES.filter(
    (c) => !successes.some((s) => s.slug === c.slug),
  );
  if (failed.length > 0) {
    console.log(`\n⚠️ ${failed.length} images failed:`);
    for (const f of failed) console.log(`  - ${f.slug}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
