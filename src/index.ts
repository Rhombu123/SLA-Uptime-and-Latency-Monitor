import { checkAllOnce, type MonitorTarget } from "./monitor.js";

const urls = ["https://example.com", "https://www.google.com"];

const targets: MonitorTarget[] = urls.map((url) => {
  return {
    url,
    method: "GET",
    timeoutMs: 10_000
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

