// shoves ping results into supabase table ping_logs
import type { MonitorResult } from "../monitor.js";
import { getSupabaseAdminClient } from "./supabase.js";

// keys have to match the columns in supabase (postgres likes snake_case)
type PingLogRow = {
  url: string;
  checked_at: string;
  ok: boolean;
  status_code: number | null;
  latency_ms: number;
  error: string | null;
};

export async function insertPingLogs(results: MonitorResult[]) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    // no .env stuff = nothing to do
    return { inserted: 0, skipped: true as const };
  }

  const rows: PingLogRow[] = results.map((r) => {
    return {
      url: r.url,
      checked_at: r.checkedAt,
      ok: r.ok,
      status_code: typeof r.status === "number" ? r.status : null,
      latency_ms: r.latencyMs,
      error: r.error ? r.error : null
    };
  });

  const { error } = await supabase.from("ping_logs").insert(rows);
  if (error) {
    throw new Error("supabase insert broke: " + error.message);
  }

  return { inserted: rows.length, skipped: false as const };
}
