// makes the supabase client. only run this on a server not in react frontend!!
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  // sb_secret_... is the new name, service_role jwt still works on old projects
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    return null;
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
