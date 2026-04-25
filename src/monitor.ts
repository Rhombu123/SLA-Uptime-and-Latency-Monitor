export type MonitorTarget = {
  url: string;
  method?: "GET" | "HEAD";
  timeoutMs?: number;
  expectedStatusCodes?: number[];
};

export type MonitorResult = {
  url: string;
  ok: boolean;
  status?: number;
  latencyMs: number;
  error?: string;
  checkedAt: string;
};

function getMs(): number {
  // Using performance.now() is nicer, but Date.now() is fine too.
  // Keeping this as a tiny helper so we don't repeat ourselves.
  if (typeof performance !== "undefined") return performance.now();
  return Date.now();
}

export async function checkOnce(
  target: MonitorTarget,
  defaults: { method: "GET" | "HEAD"; timeoutMs: number } = { method: "GET", timeoutMs: 10_000 }
): Promise<MonitorResult> {
  const method = target.method ? target.method : defaults.method;
  const timeoutMs = typeof target.timeoutMs === "number" ? target.timeoutMs : defaults.timeoutMs;
  const checkedAt = new Date().toISOString();

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

    // We're mostly timing the response headers here.
    if (res.body) {
      try {
        await res.body.cancel();
      } catch {
        // ignore
      }
    }

    const end = getMs();
    const latencyMs = Math.round(Math.max(0, end - start));

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

export async function checkAllOnce(
  targets: MonitorTarget[],
  opts?: {
    concurrency?: number;
    defaults?: { method: "GET" | "HEAD"; timeoutMs: number };
  }
): Promise<MonitorResult[]> {
  const concurrency = opts && typeof opts.concurrency === "number" ? opts.concurrency : 10;
  const defaults: { method: "GET" | "HEAD"; timeoutMs: number } =
    opts && opts.defaults ? opts.defaults : { method: "GET", timeoutMs: 10_000 };

  const results: MonitorResult[] = [];

  // A simple "batched" approach instead of a work queue.
  // It's not the most efficient, but it's easy to understand.
  for (let i = 0; i < targets.length; i += concurrency) {
    const chunk = targets.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((t) => checkOnce(t, defaults)));
    results.push(...chunkResults);
  }

  return results;
}

