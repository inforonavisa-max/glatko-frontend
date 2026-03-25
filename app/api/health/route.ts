import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
  };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("glatko_service_categories")
      .select("id")
      .limit(1);
    checks.database = error ? "error" : "ok";
    if (error) checks.databaseError = error.message;
  } catch (err) {
    checks.database = "error";
    checks.databaseError = err instanceof Error ? err.message : "unknown";
  }

  checks.upstash = process.env.UPSTASH_REDIS_REST_URL ? "configured" : "not_configured";

  const allOk = checks.database !== "error";
  return NextResponse.json(checks, { status: allOk ? 200 : 503 });
}
