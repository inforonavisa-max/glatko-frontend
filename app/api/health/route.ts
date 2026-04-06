import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";

export const runtime = "edge";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);
    checks.database = error ? "error" : "ok";
  } catch {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    },
    { status: allOk ? 200 : 503 },
  );
}
