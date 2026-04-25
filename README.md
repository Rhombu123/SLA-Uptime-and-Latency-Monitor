# SLA Uptime & Latency Monitor

Core logic for an uptime + latency worker: send HTTP requests to a list of targets, measure response time, and report results.

## Run locally

```bash
npm install
npm run dev
```

## Core API

- `checkOnce(target)`: check a single URL and return `{ ok, status, latencyMs, error? }`
- `checkAllOnce(targets, { concurrency })`: check many URLs with a concurrency limit

