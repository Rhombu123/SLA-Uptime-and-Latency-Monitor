// one pass: ping urls, print lines, save to supabase (worker will call this on a schedule)
import "dotenv/config";

import { BUILTIN_MONITOR_URLS } from "./builtinMonitorUrls.js";
import { checkAllOnce, type MonitorResult, type MonitorTarget } from "./monitor.js";
import { insertPingLogs } from "./db/pingLogs.js";

function urlsFromEnv(): string[] {
  const raw = process.env.MONITOR_URLS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function runMonitoringCycle(): Promise<MonitorResult[]> {
  const fromEnv = urlsFromEnv();
  const urls = fromEnv.length > 0 ? fromEnv : BUILTIN_MONITOR_URLS;
  if (fromEnv.length === 0) {
    console.log("No MONITOR_URLS in .env — using built-in public URLs for this run.");
  }

  const targets: MonitorTarget[] = urls.map((url) => ({ url, method: "GET", timeoutMs: 10000 }));
  const results = await checkAllOnce(targets, { concurrency: 5 });

  for (const r of results) {
    const err = r.error ? ` (${r.error})` : "";
    console.log(r.ok ? "OK" : "FAIL", `${r.latencyMs}ms`, r.status ?? "-", r.url + err);
  }

  try {
    const db = await insertPingLogs(results);
    console.log(db.skipped ? "Skipping DB (set SUPABASE_URL + secret in .env)." : `Inserted ${db.inserted} rows into ping_logs.`);
  } catch (e) {
    console.log("DB insert failed:", e);
  }

  return results;
}
