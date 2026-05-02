import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";
import { translateText } from "@/lib/translation/openai-translator";

/**
 * G-MSG-2 — async translator endpoint.
 *
 * sendMessage fires this fire-and-forget after each chat message INSERT.
 * Auth is bearer CRON_SECRET (the same secret as the other internal
 * crons) so anonymous traffic can't burn OpenAI tokens. Idempotent —
 * skips if translated_body is already populated.
 *
 * Response shape: { ok, skipped?, fromCache?, costUsd? }
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { message_id?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const messageId = (payload.message_id ?? "").trim();
  if (!messageId) {
    return NextResponse.json(
      { error: "message_id required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: msg, error: msgErr } = await admin
    .from("glatko_thread_messages")
    .select(
      `
      id,
      body,
      body_locale,
      sender_id,
      thread_id,
      translated_body,
      glatko_message_threads ( customer_id, professional_id )
      `,
    )
    .eq("id", messageId)
    .maybeSingle();

  if (msgErr) {
    return NextResponse.json(
      { error: msgErr.message },
      { status: 500 },
    );
  }
  if (!msg) {
    return NextResponse.json(
      { error: "message_not_found" },
      { status: 404 },
    );
  }

  if (msg.translated_body) {
    return NextResponse.json({ ok: true, skipped: "already_translated" });
  }

  type ThreadInfo = {
    customer_id: string | null;
    professional_id: string | null;
  } | null;
  const thread = msg.glatko_message_threads as unknown as ThreadInfo;
  if (!thread) {
    return NextResponse.json({ ok: true, skipped: "thread_missing" });
  }

  const recipientId =
    msg.sender_id === thread.customer_id
      ? thread.professional_id
      : thread.customer_id;
  if (!recipientId) {
    return NextResponse.json({ ok: true, skipped: "no_recipient" });
  }

  const { data: recipientProfile } = await admin
    .from("profiles")
    .select("preferred_locale")
    .eq("id", recipientId)
    .maybeSingle();

  const recipientLocale =
    (recipientProfile?.preferred_locale as string | null) ?? "en";

  if (recipientLocale === msg.body_locale) {
    return NextResponse.json({ ok: true, skipped: "same_locale" });
  }

  const outcome = await translateText(
    msg.body as string,
    msg.body_locale as string,
    recipientLocale,
  );

  if (!outcome.ok) {
    return NextResponse.json({
      ok: false,
      reason: outcome.reason,
      error: outcome.reason === "api_error" ? outcome.error : undefined,
    });
  }

  const { error: updateErr } = await admin
    .from("glatko_thread_messages")
    .update({
      translated_body: outcome.result.translated,
      translated_locale: recipientLocale,
      translation_provider: outcome.result.model,
    })
    .eq("id", messageId);

  if (updateErr) {
    return NextResponse.json(
      { ok: false, reason: "update_failed", error: updateErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    fromCache: outcome.result.fromCache,
    costUsd: outcome.result.costUsd,
    targetLocale: recipientLocale,
  });
}
