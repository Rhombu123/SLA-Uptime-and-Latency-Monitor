# SLA uptime thing

School project idea: ping some URLs, see how fast they answer, save results in supabase.

## how to run it

```bash
npm install
npm run build
npm start
```

`npm run dev` also works if you want to edit ts files without building every time.

**scheduled worker (every 5 min):** `npm run build` then `npm run worker`. dev version: `npm run dev:worker`. stop with ctrl+c.

You need a `.env` file (copy from `.env.example`) for Supabase keys. **`MONITOR_URLS`** is optional: if you set it (comma-separated), those URLs are pinged; if not, the app uses a small **built-in** list of public sites for demos.

## whats in the code

- `src/monitor.ts` — `checkOnce` hits one url, `checkAllOnce` does a list
- `src/db/` — writes rows to `ping_logs` if env vars are set
