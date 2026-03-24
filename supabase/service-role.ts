import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL required");
  return createClient(url, key);
}

let _client: SupabaseClient | null = null;

export function getSupabaseServiceRole(): SupabaseClient {
  if (!_client) {
    _client = getServiceRoleClient();
  }
  return _client!;
}
