/**
 * G-CAT-2-IMG-FIX: Regenerate 3 specific category images with vibe-aligned
 * prompts. Reuses the patterns established by generate-category-images.ts:
 * Replicate FLUX 1.1 Pro, Sharp WebP optimization, serial loop with 11s
 * spacing for the <$5 balance throttle, 3-attempt retry-with-backoff.
 *
 * Run with:  npx tsx scripts/regenerate-category-images.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import Replicate from "replicate";
import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
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

const REGENERATE_CATEGORIES: CategoryImage[] = [
  {
    slug: "airbnb-management",
    prompt:
      "luxury Mediterranean vacation villa welcoming guests, beautifully arranged welcome amenities on white marble table (fresh fruit basket, local Montenegrin wine bottle, fluffy white towels, fresh flowers in vase, handwritten welcome card), soft afternoon light streaming through tall windows, sea view through doorway, premium hospitality scene, photorealistic vacation rental experience photography, warm inviting atmosphere, shot on Canon R5, magazine quality",
  },
  {
    slug: "home-cleaning",
    prompt:
      "close-up premium home cleaning scene, professional gloved hand holding pristine cleaning bucket with eco-friendly supplies (white spray bottle, microfiber cloth, sponge), spotless polished marble countertop reflecting natural light, fresh lemon and herbs visible, immaculate clean modern Mediterranean kitchen background slightly blurred, premium product photography style, photorealistic, vibrant natural daylight, shot on Canon R5, commercial quality",
  },
  {
    slug: "tutoring-education",
    prompt:
      "private tutor and student studying together at intimate wooden desk, both leaning over open textbook with handwritten notes, laptop showing educational content nearby, focused 1-on-1 learning moment, warm afternoon light through Mediterranean window, books and pencils on table, teacher gesturing to explain concept, student listening attentively taking notes, photorealistic education service photography, lifestyle documentary style, shot on Canon R5",
  },
];

const OUTPUT_DIR = join(process.cwd(), "public", "categories");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateImage(
  category: CategoryImage,
  attempt = 1,
  maxAttempts = 3,
): Promise<string | null> {
  console.log(`[${category.slug}] Generating (attempt ${attempt}/${maxAttempts})...`);
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

    const sizeKB = (optimized.length / 1024).toFixed(0);
    console.log(`[${category.slug}] ✅ ${sizeKB} KB → ${filepath}`);

    return `/categories/${category.slug}.webp`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") && attempt < maxAttempts) {
      const backoff = attempt * 11_000;
      console.log(`[${category.slug}] ⏳ Rate limited, retry in ${backoff / 1000}s...`);
      await sleep(backoff);
      return generateImage(category, attempt + 1, maxAttempts);
    }
    console.error(`[${category.slug}] ❌ FAILED:`, msg);
    return null;
  }
}

async function updateDatabase(slug: string, image_url: string): Promise<void> {
  const { error } = await supabase
    .from("glatko_service_categories")
    .update({ hero_image_url: image_url })
    .eq("slug", slug);
  if (error) {
    console.error(`[DB] ❌ ${slug}: ${error.message}`);
  } else {
    console.log(`[DB] ✅ ${slug} → ${image_url}`);
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log(`Regenerating ${REGENERATE_CATEGORIES.length} category images...`);

  // Force regenerate: delete existing webp so the writeFileSync replaces.
  for (const cat of REGENERATE_CATEGORIES) {
    const filepath = join(OUTPUT_DIR, `${cat.slug}.webp`);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
      console.log(`[${cat.slug}] 🗑️  old webp deleted`);
    }
  }

  for (let i = 0; i < REGENERATE_CATEGORIES.length; i++) {
    const cat = REGENERATE_CATEGORIES[i];
    const url = await generateImage(cat);
    if (url) {
      await updateDatabase(cat.slug, url);
    }
    if (i < REGENERATE_CATEGORIES.length - 1) {
      await sleep(11_000);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
