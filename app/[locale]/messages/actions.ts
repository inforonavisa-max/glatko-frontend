"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";
import { getSiteUrl } from "@/lib/email/resend";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function openOrCreateThread(input: {
  request_id: string;
  professional_id: string;
  initial_quote_id?: string | null;
}): Promise<ActionResult<{ thread_id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase.rpc("glatko_get_or_create_thread", {
    p_request_id: input.request_id,
    p_professional_id: input.professional_id,
    p_initial_quote_id: input.initial_quote_id ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (!data) {
    return { success: false, error: "Thread creation returned no id" };
  }

  return { success: true, data: { thread_id: data as string } };
}

export async function sendMessage(input: {
  thread_id: string;
  body: string;
  body_locale: string;
}): Promise<ActionResult<{ message_id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const trimmed = (input.body ?? "").trim();
  if (trimmed.length < 1) {
    return { success: false, error: "Message cannot be empty." };
  }
  if (trimmed.length > 5000) {
    return { success: false, error: "Message too long (max 5000)." };
  }

  const { data, error } = await supabase
    .from("glatko_thread_messages")
    .insert({
      thread_id: input.thread_id,
      sender_id: user.id,
      body: trimmed,
      body_locale: input.body_locale,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const messageId = data.id as string;

  // G-MSG-2: fire-and-forget gpt-4o translation. The endpoint is
  // CRON_SECRET-gated so we authenticate by passing the same secret.
  // Awaiting would push send latency by 2-4s; the recipient sees the
  // raw body until Realtime delivers the translation a moment later.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const baseUrl = getSiteUrl();
    void fetch(`${baseUrl}/api/messages/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ message_id: messageId }),
      cache: "no-store",
    }).catch((err) => {
      console.error("[GLATKO:translate] background dispatch failed", err);
    });
  }

  revalidatePath(`/[locale]/messages/${input.thread_id}`, "page");
  revalidatePath(`/[locale]/messages`, "page");

  return { success: true, data: { message_id: messageId } };
}

export async function markThreadAsRead(thread_id: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.rpc("glatko_mark_thread_read", {
    p_thread_id: thread_id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/[locale]/messages`, "page");
  return { success: true };
}
