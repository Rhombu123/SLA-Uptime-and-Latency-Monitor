// types for what we pass in / get back (typescript makes this easier than plain js imo)

// one website to check
export type MonitorTarget = {
  url: string;
  method?: "GET" | "HEAD";
  timeoutMs?: number;
  expectedStatusCodes?: number[];
};

// what happened when we checked that website
export type MonitorResult = {
  url: string;
  ok: boolean;
  status?: number;
  latencyMs: number;
  error?: string;
  checkedAt: string;
};

// helper to read a clock in milliseconds
function getMs(): number {
  if (typeof performance !== "undefined") return performance.now();
  return Date.now();
}

// hit a single url and time it
export async function checkOnce(
  target: MonitorTarget,
  defaults: { method: "GET" | "HEAD"; timeoutMs: number } = { method: "GET", timeoutMs: 10000 }
): Promise<MonitorResult> {
  const method = target.method ? target.method : defaults.method;
  const timeoutMs = typeof target.timeoutMs === "number" ? target.timeoutMs : defaults.timeoutMs;
  // supabase wants a normal timestamp string
  const checkedAt = new Date().toISOString();

  // abort = stop waiting if its too slow
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const start = getMs();
  try {
    const res = await fetch(target.url, {
      method,
      redirect: "manual",
      signal: controller.signal
    });

    // dont download the whole page we just want headers basically
    if (res.body) {
      try {
        await res.body.cancel();
      } catch {
        // whatever
      }
    }

    const end = getMs();
    const latencyMs = Math.round(Math.max(0, end - start));

    // if status is in this list we call it "up"
    const expected = target.expectedStatusCodes
      ? target.expectedStatusCodes
      : [200, 204, 301, 302, 307, 308];
    let ok = false;
    for (const s of expected) {
      if (s === res.status) {
        ok = true;
        break;
      }
    }

    return {
      url: target.url,
      ok,
      status: res.status,
      latencyMs,
      checkedAt
    };
  } catch (err) {
    // timed out or dns broke or whatever
    const end = getMs();
    const latencyMs = Math.round(Math.max(0, end - start));
    let error = "unknown error";
    if (err instanceof Error) error = err.message;
    else if (typeof err === "string") error = err;
    return {
      url: target.url,
      ok: false,
      latencyMs,
      error,
      checkedAt
    };
  } finally {
    clearTimeout(timeout);
  }
}

// check a bunch of urls, max "concurrency" at the same time
export async function checkAllOnce(
  targets: MonitorTarget[],
  opts?: {
    concurrency?: number;
    defaults?: { method: "GET" | "HEAD"; timeoutMs: number };
  }
): Promise<MonitorResult[]> {
  const concurrency = opts && typeof opts.concurrency === "number" ? opts.concurrency : 10;
  const defaults: { method: "GET" | "HEAD"; timeoutMs: number } =
    opts && opts.defaults ? opts.defaults : { method: "GET", timeoutMs: 10000 };

  const results: MonitorResult[] = [];

  // slice into batches bc i didnt want to write a fancy queue lol
  for (let i = 0; i < targets.length; i += concurrency) {
    const chunk = targets.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((t) => checkOnce(t, defaults)));
    results.push(...chunkResults);
  }

  return results;
}
