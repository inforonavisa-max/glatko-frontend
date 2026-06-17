import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// next/cache unstable_cache is a passthrough under vitest (no Next runtime); stub
// it to just invoke the factory so geocodeCity's L1 layer runs the real fetch path.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...a: unknown[]) => unknown) => fn,
}));

import {
  geocodeCity,
  reverseGeocode,
  normalizeQuery,
  matchCity,
} from "./geocode";

const TOKEN_KEY = "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN";

describe("normalizeQuery", () => {
  it("strips accents, lowercases, collapses non-alphanumerics", () => {
    expect(normalizeQuery("Nikšić")).toBe("niksic");
    expect(normalizeQuery("  Herceg  Novi ")).toBe("herceg novi");
    expect(normalizeQuery("Žabljak")).toBe("zabljak");
  });
});

describe("matchCity — accent-insensitive name/slug", () => {
  it("matches by name (accented) and slug", () => {
    expect(matchCity("budva")?.slug).toBe("budva");
    expect(matchCity("Nikšić")?.slug).toBe("niksic");
    expect(matchCity("herceg-novi")?.slug).toBe("herceg-novi");
  });
  it("returns null for unknown / empty", () => {
    expect(matchCity("Atlantis")).toBeNull();
    expect(matchCity("")).toBeNull();
  });
});

describe("geocodeCity — two-layer + graceful fallback", () => {
  const realFetch = globalThis.fetch;
  const realToken = process.env[TOKEN_KEY];

  beforeEach(() => {
    delete process.env[TOKEN_KEY];
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realToken === undefined) delete process.env[TOKEN_KEY];
    else process.env[TOKEN_KEY] = realToken;
    vi.restoreAllMocks();
  });

  it("L0: known city short-circuits — ZERO Mapbox calls", async () => {
    const spy = vi.fn();
    globalThis.fetch = spy as unknown as typeof fetch;
    const pt = await geocodeCity("Budva");
    expect(pt).toEqual({ lat: 42.2911, lng: 18.84, source: "cities" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("token absent → null, no fetch (graceful)", async () => {
    const spy = vi.fn();
    globalThis.fetch = spy as unknown as typeof fetch;
    const pt = await geocodeCity("some random street address");
    expect(pt).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("Mapbox 200 with a result → {lat,lng,source:mapbox}", async () => {
    process.env[TOKEN_KEY] = "pk.test";
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ features: [{ center: [18.7712, 42.4247] }] }),
    })) as unknown as typeof fetch;
    const pt = await geocodeCity("a place that is not in cities");
    expect(pt).toEqual({ lat: 42.4247, lng: 18.7712, source: "mapbox" });
  });

  it("Mapbox non-200 → null (graceful)", async () => {
    process.env[TOKEN_KEY] = "pk.test";
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    expect(await geocodeCity("unknown place 200x")).toBeNull();
  });

  it("Mapbox throws → null (graceful)", async () => {
    process.env[TOKEN_KEY] = "pk.test";
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network");
    }) as unknown as typeof fetch;
    expect(await geocodeCity("unknown place throw")).toBeNull();
  });

  it("Mapbox zero results → null (graceful)", async () => {
    process.env[TOKEN_KEY] = "pk.test";
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ features: [] }),
    })) as unknown as typeof fetch;
    expect(await geocodeCity("nowhere zero")).toBeNull();
  });

  it("empty input → null", async () => {
    expect(await geocodeCity("   ")).toBeNull();
  });
});

describe("reverseGeocode — geolocation passthrough", () => {
  it("valid coords pass through", () => {
    expect(reverseGeocode(42.44, 19.26)).toEqual({
      lat: 42.44,
      lng: 19.26,
      source: "cities",
    });
  });
  it("out-of-range / non-finite → null", () => {
    expect(reverseGeocode(91, 0)).toBeNull();
    expect(reverseGeocode(0, 181)).toBeNull();
    expect(reverseGeocode(Number.NaN, 0)).toBeNull();
  });
});
