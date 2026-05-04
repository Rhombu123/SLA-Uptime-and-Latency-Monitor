# SLA uptime thing

School project idea: ping some URLs, see how fast they answer, save results in supabase.

## how to run it

```bash
npm install
npm run build
npm start
```

`npm run dev` also works if you want to edit ts files without building every time.

You need a `.env` file with supabase stuff (copy from `.env.example`). dont put real keys in github only in `.env` on your laptop.

## whats in the code

- `src/monitor.ts` — `checkOnce` hits one url, `checkAllOnce` does a list
- `src/db/` — writes rows to `ping_logs` if env vars are set
