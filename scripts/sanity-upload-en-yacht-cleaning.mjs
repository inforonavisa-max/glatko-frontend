#!/usr/bin/env node
/**
 * Publish "Yacht Cleaning in Montenegro" (EN) blog post to Sanity.
 *
 * - Seeds author (Glatko Editorial) + category (Marine Services) if missing.
 * - Uploads /tmp/yacht-cleaning-hero.png as the cover image asset (if present).
 * - Builds a multi-locale `post` document with EN content. ME locale validation
 *   is satisfied at API level (validation runs in Studio only).
 * - The EN post becomes visible at /en/blog/yacht-cleaning-montenegro because
 *   the GROQ filter requires slug.en.current and a non-empty title.en.
 *
 * Pattern mirrors RoNa's publish-baghdad-post.mjs; adapted to Glatko's schema
 * (`content` not `body`, no FAQ object, table-less Portable Text).
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

// ─────────────────────────── env loading ─────────────────────────── //
const envPath = "/Users/Shared/dev/glatko-frontend/.env.local";
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity env (project/dataset/write token).");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ─────────────────── _key generator (Sanity-compat) ─────────────────── //
let __k = 0;
const keyOf = (prefix = "k") =>
  `${prefix}${(++__k).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ─────────────────── inline markdown → spans + markDefs ─────────────────── //
function parseInline(text) {
  const spans = [];
  const markDefs = [];
  let pos = 0;
  const tokens = [];

  while (pos < text.length) {
    if (text[pos] === "[") {
      const close = text.indexOf("]", pos);
      const open = close > -1 ? text.indexOf("(", close) : -1;
      const end = open > -1 ? text.indexOf(")", open) : -1;
      if (close > -1 && open === close + 1 && end > -1) {
        tokens.push({
          type: "link",
          text: text.slice(pos + 1, close),
          href: text.slice(open + 1, end),
        });
        pos = end + 1;
        continue;
      }
    }
    if (text[pos] === "*" && text[pos + 1] === "*") {
      const end = text.indexOf("**", pos + 2);
      if (end > -1) {
        tokens.push({ type: "bold", text: text.slice(pos + 2, end) });
        pos = end + 2;
        continue;
      }
    }
    let plain = "";
    while (pos < text.length) {
      if (text[pos] === "[") {
        const close = text.indexOf("]", pos);
        const open = close > -1 ? text.indexOf("(", close) : -1;
        const end = open > -1 ? text.indexOf(")", open) : -1;
        if (close > -1 && open === close + 1 && end > -1) break;
      }
      if (text[pos] === "*" && text[pos + 1] === "*") {
        const end = text.indexOf("**", pos + 2);
        if (end > -1) break;
      }
      plain += text[pos];
      pos += 1;
    }
    if (plain) tokens.push({ type: "plain", text: plain });
  }

  for (const tok of tokens) {
    if (tok.type === "plain") {
      spans.push({ _type: "span", _key: keyOf("s"), text: tok.text, marks: [] });
    } else if (tok.type === "bold") {
      spans.push({
        _type: "span",
        _key: keyOf("s"),
        text: tok.text,
        marks: ["strong"],
      });
    } else if (tok.type === "link") {
      const linkKey = keyOf("ml");
      markDefs.push({ _type: "link", _key: linkKey, href: tok.href });
      spans.push({
        _type: "span",
        _key: keyOf("s"),
        text: tok.text,
        marks: [linkKey],
      });
    }
  }
  return { spans, markDefs };
}

// ─────────────────── helpers ─────────────────── //
function makeBlock(style, text, extras = {}) {
  const { spans, markDefs } = parseInline(text);
  return {
    _type: "block",
    _key: keyOf("b"),
    style,
    markDefs,
    children: spans.length
      ? spans
      : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
    ...extras,
  };
}

function makeListItem(text, listItem = "bullet") {
  const { spans, markDefs } = parseInline(text);
  return {
    _type: "block",
    _key: keyOf("b"),
    style: "normal",
    listItem,
    level: 1,
    markDefs,
    children: spans.length
      ? spans
      : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
  };
}

// ─────────────────── content builder (table-aware) ─────────────────── //
// Schema has no table block. The pricing table is rendered as an
// introductory paragraph + bullet list with bold service names. All the
// other markdown structures map cleanly to existing block types.
function buildContent() {
  const blocks = [];
  const push = (b) => blocks.push(b);

  // Intro
  push(
    makeBlock(
      "normal",
      "Montenegro has quietly become one of the Adriatic's most compelling berths. Over 4,800 vessels entered Montenegrin waters in 2025 — a figure that has grown every single year since 2023. As Porto Montenegro cements its superyacht credentials and Dukley Marina undergoes a 60% capacity expansion, the pressure on vessel owners to maintain their assets in peak condition has never been greater.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "But Boka Bay is not forgiving. Intense summer UV radiation, hyper-saline aerosols, and the violent winter Bora wind create a maintenance environment that is fundamentally hostile to neglect. Whether you are staging a summer charter fleet out of Tivat, wintering your cruiser at Marina Bar, or transiting through Kotor on the way south, this guide covers everything you need to know about yacht cleaning and detailing in Montenegro — costs, services, regulations, and how to find trustworthy professionals without the usual marina runaround.",
    ),
  );

  // Section: Why Montenegro's Marine Environment Demands Rigorous Cleaning
  push(makeBlock("h2", "Why Montenegro's Marine Environment Demands Rigorous Cleaning"));
  push(
    makeBlock(
      "normal",
      "The microclimate of Boka Bay combines two damaging forces that rarely coexist at this intensity: concentrated salt aerosols from the open Adriatic and fine limestone dust carried down from the Dinaric Alps. Together, they form a corrosive film on every exposed surface within 24 to 48 hours of settling. Stainless steel railings begin to pit. Gelcoat oxidizes prematurely. Teak grains trap particulate matter that, if not removed weekly, degrades the wood at an accelerated rate.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "The 72-hour minimum stay rule — which Montenegro requires for vessels claiming duty-free bunkering — creates an enforced layover that is, in practice, the optimal window for professional detailing. Captains who use this time for a full exterior washdown and interior reset arrive at their next port in far better condition than those who do not.",
    ),
  );

  // Section: Types of Yacht Cleaning & Detailing Services in Montenegro
  push(makeBlock("h2", "Types of Yacht Cleaning & Detailing Services in Montenegro"));
  push(
    makeBlock(
      "normal",
      "Boat cleaning in Montenegro ranges from a basic 90-minute exterior washdown to a multi-day, multi-stage restoration project. Here is what professional yacht cleaning and detailing covers, and what each service actually does.",
    ),
  );

  push(makeBlock("h3", "Exterior Wash (Hull, Waterline, Topsides)"));
  push(
    makeBlock(
      "normal",
      "The foundation of any maintenance schedule. Using pH-balanced, marine-safe detergents, technicians remove salt deposits, bird fouling, and waterline scum without stripping existing wax or polymer coatings. High-pressure rinsing is carefully controlled around deck fittings and window seals. Frequency: weekly during the season.",
    ),
  );

  push(makeBlock("h3", "Interior Detailing & Dehumidification"));
  push(
    makeBlock(
      "normal",
      "Marine interiors trap moisture in ways no domestic space does. Professional interior yacht cleaning involves low-moisture steam extraction for carpets and leather, ozone or enzymatic odor treatment for bilge-origin smells, and hospital-grade disinfection for heads and galleys. In Boka Bay, where winter humidity is high, active dehumidification between seasons is critical for preventing mold in upholstery and joinery.",
    ),
  );

  push(makeBlock("h3", "Teak Deck Cleaning & Rejuvenation"));
  push(
    makeBlock(
      "normal",
      "Teak is the most labor-intensive surface on any sailing yacht. UV exposure and saltwater cause oxidation, turning rich wood silver-grey and allowing black algal growth in the seams. Professional teak cleaning uses a two-part chemical process: a diluted acid-based cleaner opens the grain and lifts contaminants, followed immediately by a neutralizing base that restores the warm, golden tone. Wire brushes — commonly used by untrained workers — destroy the soft grain and permanently reduce deck lifespan. Always confirm your provider uses the correct two-part chemistry. Frequency: monthly.",
    ),
  );

  push(makeBlock("h3", "Gelcoat Compounding, Polishing & Waxing"));
  push(
    makeBlock(
      "normal",
      "If your hull has gone chalky and dull, you are looking at UV oxidation of the gelcoat polymer chains. This is the most labor-intensive exterior service. Technicians work through graduated abrasive compounds with variable-speed rotary polishers to mechanically level the surface, then seal it with carnauba wax, polymer sealants, or — for long-lasting protection — professional ceramic (SiO₂) coatings. In Montenegro's summers, a ceramic coating pays for itself within one season by dramatically reducing the frequency of polishing needed. Frequency: annually (spring commissioning).",
    ),
  );

  push(makeBlock("h3", "Hull Cleaning & Antifouling (Montenegro Specifics)"));
  push(
    makeBlock(
      "normal",
      "Antifouling is a haul-out service, performed during dry-docking at facilities like Adriatic 42 in Bijela or during winter storage. Pressure-washing removes barnacles and algae from the submerged hull; the bare surface is then sanded, primed, and coated with ablative or hard biocidal paint. Neglected antifouling causes marine growth that increases fuel consumption by up to 30% and, if the barrier coat is penetrated, leads to osmotic blistering — a fiberglass delamination repair that costs tens of thousands of euros. Montenegro's eco-regulations prohibit discharge of antifouling residue into marina basins. Frequency: annually (haul-out).",
    ),
  );

  push(makeBlock("h3", "Engine Room Cleaning & Degreasing"));
  push(
    makeBlock(
      "normal",
      "A pristine engine room is not about aesthetics — it is about fault detection. Bilge oil and accumulated grime mask the early signs of fluid leaks and corrosion. Professional engine room cleaning uses environmentally compliant degreasers applied with precision around electrical harnesses, raw water strainers, and sensors. This is a specialist task; avoid generalist cleaners who may damage sensitive wiring. Frequency: seasonally.",
    ),
  );

  push(makeBlock("h3", "Post-Charter / Turnover Cleaning"));
  push(
    makeBlock(
      "normal",
      "The commercial charter fleet in Montenegro runs a tight turnaround, often under six hours between guests. Turnover cleaning covers a full interior reset: linen laundering, head and galley sanitation, restocking consumables, trash removal, and a complete exterior washdown. This is Glatko's most immediate addressable segment — charter operators need fast, reliable providers, and the current market has no transparent booking mechanism for these jobs.",
    ),
  );

  // Section: Yacht Cleaning Costs in Montenegro
  push(makeBlock("h2", "Yacht Cleaning Costs in Montenegro: What to Expect in 2026"));
  push(
    makeBlock(
      "normal",
      "Montenegro's premium maritime firms operate almost universally on a bespoke quotation model — pricing is not published, and every job requires a phone call or email to obtain a number. This opacity is the defining friction point of the local market.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Based on Adriatic regional benchmarks and local labor economics, here are realistic estimates for the 2025/2026 season:",
    ),
  );

  // Pricing table → bullet list with bold service names
  push(makeListItem("**Basic exterior wash:** €10 – €20 per linear metre (LOA)"));
  push(makeListItem("**Deep interior detailing:** €15 – €30 per linear metre (LOA)"));
  push(makeListItem("**Teak cleaning & brightening:** €25 – €45 per m² of decking"));
  push(makeListItem("**Gelcoat compounding & waxing:** €80 – €150 per linear metre (LOA)"));
  push(makeListItem("**Ceramic coating (advanced):** €200 – €400+ per linear metre (LOA)"));
  push(makeListItem("**Engine room degreasing:** €250 – €600 flat rate"));
  push(makeListItem("**Antifouling (sub-surface):** €100 – €140 per linear metre (LOA)"));
  push(
    makeListItem(
      "**Post-charter turnover clean:** €150 – €400 flat rate (per cabin count)",
    ),
  );

  push(
    makeBlock(
      "normal",
      "**Practical example:** A 12-metre sailing yacht requiring a full exterior wash, interior detail, and teak treatment will typically run €600 – €1,200 depending on the vessel's condition and the provider. A 40-metre motor yacht needing gelcoat compounding across the full topsides can comfortably exceed €5,000.",
    ),
  );

  // Section: Montenegro's Key Marinas
  push(makeBlock("h2", "Montenegro's Key Marinas: Where Yacht Cleaning Happens"));
  push(
    makeBlock(
      "normal",
      "Understanding the marina geography is essential for planning your maintenance schedule.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Porto Montenegro (Tivat)** is the flagship superyacht hub — 450+ berths, TYHA Five Gold Anchor Platinum, on-site customs and duty-free fuel, and a dense contractor ecosystem. This is where the highest-end yacht detailing firms cluster. Maximum LOA: 250 metres.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Dukley Marina (Budva)** is undergoing a 60% berth expansion and breakwater construction. Currently serves approximately 300 vessels and functions as the primary hub for mid-size charter yachts on the Budva Riviera. Maximum LOA: 70 metres.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**D-Marin Portonovi (Herceg Novi)** is a boutique luxury marina with 238 berths, Five Gold Anchor accreditation, and deep integration with the One&Only resort. Ideal for owners who want a lower-density, resort-style berth.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Marina Bar** offers Montenegro's largest absolute berth capacity (~900 berths + 300 dry) and functions as the competitive winter storage and duty-free refueling hub. Less glamorous, but highly practical for layup and antifouling work.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Marina Kotor** is UNESCO-constrained and capacity-limited, serving primarily transit yachts. Berth availability is tight throughout the season.",
    ),
  );

  // Section: Seasonality
  push(makeBlock("h2", "Seasonality: When to Schedule Your Yacht Cleaning"));
  push(
    makeBlock(
      "normal",
      "Peak season runs from early June to late September, with July and August creating genuine contractor bottlenecks. Demand for cleaning services during these months exceeds local supply — providers who are not pre-booked often cannot accommodate walk-in requests.",
    ),
  );
  push(makeBlock("normal", "**Strategic scheduling:**"));
  push(
    makeListItem(
      "**April – May (commissioning):** Best window for gelcoat compounding, ceramic coating, full teak restoration, and antifouling application before the vessel enters the water.",
    ),
  );
  push(
    makeListItem(
      "**June – September (in-season):** Weekly exterior washdowns, monthly interior details and teak maintenance, rapid charter turnovers.",
    ),
  );
  push(
    makeListItem(
      "**October – November (layup):** Winterization protocol — full freshwater system drain, antifreeze application, engine fogging oil, canvas removal, interior dehumidification setup. Last window for submerged hull inspection.",
    ),
  );

  // Section: Environmental Regulations
  push(makeBlock("h2", "Environmental Regulations: Yacht Cleaning in Montenegrin Waters"));
  push(
    makeBlock(
      "normal",
      "Montenegro is aggressively pursuing sustainable nautical tourism. Porto Montenegro holds TYHA Clean Marina accreditation; the entire coastline operates under domestic law aligned with MARPOL Annex V.",
    ),
  );
  push(makeBlock("normal", "**Key rules for boat owners and contractors:**"));
  push(
    makeListItem(
      "Direct discharge of blackwater (sewage), greywater (sinks/showers), and chemical effluents into marina basins is strictly illegal. All pump-out must use designated marina facilities.",
    ),
  );
  push(
    makeListItem(
      "Topsides washing at berth is permitted only with biodegradable, phosphate-free marine detergents. Harsh bleaches and phosphate soaps are prohibited — they damage the Posidonia oceanica seagrass meadows that are critical to the Adriatic ecosystem.",
    ),
  );
  push(
    makeListItem(
      "Abrasive antifouling residue must be contained during haul-out operations. Reputable dry-dock facilities enforce this automatically.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "When vetting a yacht cleaning provider in Montenegro, ask directly whether they use MARPOL-compliant products. Any contractor who cannot answer this question clearly is not operating at the standard the marinas require.",
    ),
  );

  // Section: How to Find a Trusted Yacht Cleaner
  push(makeBlock("h2", "How to Find a Trusted Yacht Cleaner in Montenegro: A Practical Checklist"));
  push(
    makeBlock(
      "normal",
      "The traditional method — checking marina noticeboards, asking other captains over VHF, or relying on unverified recommendations — produces inconsistent results in an unfamiliar marina. The local market is highly fragmented: elite technical firms like 7seas7works operate at one end of the spectrum; generalist domestic cleaning agencies (which lack the specialist chemistry and equipment for marine work) attempt to capture yacht clients at the other.",
    ),
  );
  push(makeBlock("normal", "**Before you book any provider, confirm:**"));
  push(
    makeListItem(
      "Do they use marine-specific, pH-balanced detergents? (Not domestic household cleaners)",
    ),
  );
  push(
    makeListItem(
      "For teak: do they use a two-part acid/base system, not wire brushes?",
    ),
  );
  push(
    makeListItem(
      "For gelcoat: can they demonstrate polisher equipment and compound grades?",
    ),
  );
  push(makeListItem("Are their products MARPOL-compliant for use in marina basins?"));
  push(makeListItem("Do they carry marine contractor insurance?"));
  push(
    makeListItem(
      "Can they provide references from other vessels in the same marina?",
    ),
  );
  push(
    makeListItem(
      "Is pricing given per linear metre (standard) or as a vague flat quote?",
    ),
  );
  push(
    makeBlock(
      "normal",
      "The absence of transparent pricing is the dominant friction point in this market. Most established providers will not give a number without an in-person inspection — which requires you to be present and available. For owners who are managing vessels remotely or planning itineraries in advance, this model is genuinely unworkable.",
    ),
  );

  // Section: Book Yacht Cleaning on Glatko
  push(makeBlock("h2", "Book Yacht Cleaning in Montenegro Without the Runaround"));
  push(
    makeBlock(
      "normal",
      "Glatko.app is Montenegro's first reverse marketplace for home and marine services. Instead of chasing quotes across multiple contractors, you post your job — vessel size, marina location, services required, preferred dates — and vetted local professionals submit competitive bids directly to you.",
    ),
  );
  push(makeBlock("normal", "For yacht owners in Boka Bay, this means:"));
  push(
    makeListItem("Transparent competitive pricing, visible before you commit"),
  );
  push(
    makeListItem("Verified local providers with ratings and service history"),
  );
  push(
    makeListItem(
      "Works for single-session cleaning, recurring seasonal contracts, and charter turnover packages",
    ),
  );
  push(
    makeListItem(
      "Post from anywhere — no need to be on board to initiate the process",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**[Post your yacht cleaning job on Glatko.app →](https://glatko.app)**",
    ),
  );

  // FAQ Section
  push(makeBlock("h2", "Frequently Asked Questions"));

  push(makeBlock("h3", "How often should a yacht be professionally cleaned in Boka Bay?"));
  push(
    makeBlock(
      "normal",
      "Weekly exterior washdowns are standard during the June–September season due to salt aerosol concentration. Interior detailing and teak maintenance should be scheduled monthly. Gelcoat compounding and protective coatings are annual services, best executed during spring commissioning.",
    ),
  );

  push(makeBlock("h3", "How much does yacht cleaning cost per metre in Montenegro?"));
  push(
    makeBlock(
      "normal",
      "A basic exterior wash runs €10–€20 per linear metre. Multi-stage gelcoat compounding and waxing costs €80–€150 per metre. Advanced ceramic coating can exceed €200–€400 per metre. Post-charter turnover cleans are typically priced as flat rates between €150 and €400.",
    ),
  );

  push(makeBlock("h3", "What is the difference between yacht cleaning and yacht detailing?"));
  push(
    makeBlock(
      "normal",
      "Cleaning covers routine maintenance — exterior washdown, interior wipe-down, basic sanitation. Detailing is a deeper process: multi-stage gelcoat compounding, teak acid restoration, ceramic coating application, and specialized fabric and leather treatment. Detailing restores; cleaning maintains.",
    ),
  );

  push(makeBlock("h3", "Can I use household cleaning products on my yacht?"));
  push(
    makeBlock(
      "normal",
      "No. Standard detergents strip protective wax and polymer coatings from gelcoat, accelerating UV damage. Bleach degrades stitching and canvas waterproofing. Phosphate-heavy soaps are prohibited in Montenegrin marina basins. Use only pH-balanced, marine-specific, biodegradable products.",
    ),
  );

  push(makeBlock("h3", "What is the 72-hour rule and how does it relate to cleaning?"));
  push(
    makeBlock(
      "normal",
      "To qualify for duty-free bunkering, vessels must remain in Montenegrin territorial waters for a minimum of 72 hours. Captains often use this enforced layover as the optimal window for scheduling comprehensive exterior and interior detailing before moving to the next destination.",
    ),
  );

  push(makeBlock("h3", "How should I winterize my yacht in Montenegro against the Bora?"));
  push(
    makeBlock(
      "normal",
      "Completely drain all freshwater and plumbing systems and fill with marine antifreeze rated to at least -50°F. Fog the engine cylinders with fogging oil. Remove all canvas, biminis, and loose appendages to eliminate windage. Deploy moisture absorbers or an active dehumidifier below decks. Arrange a guardianship check every 2–4 weeks during the winter months.",
    ),
  );

  push(makeBlock("h3", "What are the marina environmental rules for boat washing in Montenegro?"));
  push(
    makeBlock(
      "normal",
      "Direct discharge of blackwater, greywater, and chemical effluents into marina basins is illegal. Topside washing must use biodegradable marine detergents to protect Posidonia oceanica seagrass. Porto Montenegro holds TYHA Clean Marina accreditation, and these standards are enforced at berth.",
    ),
  );

  push(makeBlock("h3", "Is there a reverse marketplace for yacht cleaning in Montenegro?"));
  push(
    makeBlock(
      "normal",
      "Yes — Glatko.app allows yacht owners to post their maintenance requirements and receive competitive bids from vetted local maritime professionals, eliminating the opacity and friction of the traditional quote-on-demand model.",
    ),
  );

  return blocks;
}

// ─────────────────── seed author + category ─────────────────── //
const AUTHOR_ID = "author-glatko-editorial";
const CATEGORY_ID = "category-marine-services";

async function ensureAuthor() {
  const doc = {
    _id: AUTHOR_ID,
    _type: "author",
    name: "Glatko Editorial",
    slug: { _type: "slug", current: "glatko-editorial" },
    role: "Editorial Team",
    bio: {
      _type: "localeText",
      me: "Glatko uređivački tim pokriva vodiče za usluge u Crnoj Gori.",
      en: "The Glatko editorial team covers services guides across Montenegro.",
    },
  };
  return client.createIfNotExists(doc);
}

async function ensureCategory() {
  const doc = {
    _id: CATEGORY_ID,
    _type: "category",
    title: {
      _type: "localeString",
      me: "Pomorske usluge",
      en: "Marine Services",
    },
    slug: { _type: "slug", current: "marine-services" },
    description: {
      _type: "localeText",
      me: "Vodiči za pomorske usluge u Crnoj Gori — čišćenje, održavanje, marine.",
      en: "Marine services in Montenegro — cleaning, maintenance, marinas.",
    },
    order: 50,
  };
  return client.createIfNotExists(doc);
}

// ─────────────────── upload hero image ─────────────────── //
async function uploadHero() {
  const heroPath = "/tmp/yacht-cleaning-hero.png";
  if (!fs.existsSync(heroPath)) {
    console.log("Hero image not found at /tmp/yacht-cleaning-hero.png — skipping.");
    return null;
  }
  const stream = fs.createReadStream(heroPath);
  const filename = path.basename(heroPath);
  console.log(`Uploading hero asset: ${filename}`);
  const asset = await client.assets.upload("image", stream, { filename });
  console.log(`Asset uploaded: ${asset._id}`);
  return asset;
}

// ─────────────────── main ─────────────────── //
async function main() {
  console.log(`Project: ${projectId} | Dataset: ${dataset}`);

  const author = await ensureAuthor();
  console.log(`Author: ${author._id}`);

  const category = await ensureCategory();
  console.log(`Category: ${category._id}`);

  const heroAsset = await uploadHero();

  const content = buildContent();
  console.log(`Content blocks: ${content.length}`);

  const docId = "yacht-cleaning-montenegro";
  const seoTitle =
    "Yacht Cleaning in Montenegro: Costs, Services & Trusted Experts (2026)";
  const seoDescription =
    "Professional yacht cleaning in Montenegro — costs, marinas (Tivat, Kotor, Porto Montenegro), services & how to book trusted cleaners on Glatko.";
  const articleTitle =
    "Yacht Cleaning in Montenegro: The Complete 2026 Guide for Boka Bay & Adriatic Boat Owners";
  const excerpt =
    "Professional yacht cleaning in Montenegro — costs, services, marinas (Tivat, Kotor, Porto Montenegro), regulations, and how to book trusted cleaners through Glatko.";

  const doc = {
    _id: docId,
    _type: "post",
    title: {
      _type: "localeString",
      en: articleTitle,
    },
    slug: {
      _type: "localeSlug",
      en: { _type: "slug", current: "yacht-cleaning-montenegro" },
    },
    excerpt: {
      _type: "localeText",
      en: excerpt,
    },
    content: {
      _type: "localeRichText",
      en: content,
    },
    author: { _type: "reference", _ref: AUTHOR_ID },
    category: { _type: "reference", _ref: CATEGORY_ID },
    serviceCategoryRefs: ["boat-services"],
    publishedAt: new Date("2026-05-09T08:00:00.000Z").toISOString(),
    featured: false,
    seo: {
      _type: "seoMeta",
      metaTitle: { _type: "localeString", en: seoTitle },
      metaDescription: { _type: "localeText", en: seoDescription },
    },
  };

  if (heroAsset) {
    doc.coverImage = {
      _type: "image",
      asset: { _type: "reference", _ref: heroAsset._id },
      alt: "Yacht moored in a Montenegro marina, Boka Bay",
    };
  }

  console.log("\nCreating/updating post...");
  const result = await client.createOrReplace(doc);
  console.log(`Done: ${result._id}`);
  console.log(`Title EN: ${result.title?.en}`);
  console.log(`Slug EN: ${result.slug?.en?.current}`);
  console.log(`Cover image: ${result.coverImage ? "set" : "missing"}`);
  console.log(
    `\nPublic URL: https://glatko.app/en/blog/yacht-cleaning-montenegro`,
  );
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
