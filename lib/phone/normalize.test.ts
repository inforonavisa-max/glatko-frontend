import { describe, it, expect } from "vitest";
import { normalizePhoneE164 } from "./normalize";

describe("normalizePhoneE164 — authoritative server normalizer", () => {
  it("rejects empty / whitespace", () => {
    expect(normalizePhoneE164("")).toEqual({ ok: false, error: "empty" });
    expect(normalizePhoneE164("   ")).toEqual({ ok: false, error: "empty" });
    expect(normalizePhoneE164(null)).toEqual({ ok: false, error: "empty" });
    expect(normalizePhoneE164(undefined)).toEqual({ ok: false, error: "empty" });
  });

  it("rejects garbage / too short / wrong-shape", () => {
    expect(normalizePhoneE164("abc")).toEqual({ ok: false, error: "invalid" });
    expect(normalizePhoneE164("12")).toEqual({ ok: false, error: "invalid" });
    expect(normalizePhoneE164("not a phone")).toEqual({ ok: false, error: "invalid" });
    // explicit country code with a bogus trailing trunk 0 → not a valid number
    expect(normalizePhoneE164("+90 0532")).toEqual({ ok: false, error: "invalid" });
  });

  it("normalizes a bare ME local number to E.164 (+382)", () => {
    // 068121147 is a real validated ME mobile (matches +38268121147 in prod).
    expect(normalizePhoneE164("068121147")).toEqual({
      ok: true,
      e164: "+38268121147",
    });
    expect(normalizePhoneE164("068 121 147")).toEqual({
      ok: true,
      e164: "+38268121147",
    });
    expect(normalizePhoneE164("(068) 121-147")).toEqual({
      ok: true,
      e164: "+38268121147",
    });
  });

  it("handles the 00 international prefix", () => {
    expect(normalizePhoneE164("0038268121147")).toEqual({
      ok: true,
      e164: "+38268121147",
    });
  });

  it("keeps an explicit international number's own country (region ignored)", () => {
    // valid TR mobile — defaultCountry ME must NOT override an explicit +90
    const tr = normalizePhoneE164("+90 532 111 22 33");
    expect(tr.ok).toBe(true);
    if (tr.ok) expect(tr.e164).toBe("+905321112233");
    // already-E.164 ME number passes through unchanged
    expect(normalizePhoneE164("+38268121147")).toEqual({
      ok: true,
      e164: "+38268121147",
    });
  });
});
