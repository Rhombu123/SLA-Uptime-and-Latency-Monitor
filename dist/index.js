// load .env first!!! otherwise supabase keys are undefined and nothing saves
import "dotenv/config";
import { checkAllOnce } from "./monitor.js";
import { insertPingLogs } from "./db/pingLogs.js";
// TODO later: read this list from a json file or something
const urls = ["https://example.com", "https://www.google.com"];
const targets = urls.map((url) => {
    return {
        url,
        method: "GET",
        timeoutMs: 10000
    };
});
const results = await checkAllOnce(targets, { concurrency: 5 });
for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const okText = r.ok ? "OK" : "FAIL";
    const statusText = typeof r.status === "number" ? String(r.status) : "-";
    const errorText = r.error ? ` (${r.error})` : "";
    console.log(okText, `${r.latencyMs}ms`, statusText, r.url + errorText);
}
// supabase part
try {
    const dbResult = await insertPingLogs(results);
    if (!dbResult.skipped) {
        console.log(`Inserted ${dbResult.inserted} rows into ping_logs.`);
    }
    else {
        console.log("Skipping DB insert (need SUPABASE_URL and SUPABASE_SECRET_KEY, or legacy SUPABASE_SERVICE_ROLE_KEY).");
    }
}
catch (e) {
    console.log("DB insert failed:", e);
}
