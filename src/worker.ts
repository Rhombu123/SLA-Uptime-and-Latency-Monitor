// long-running process: run checks now, then every 5 minutes (cron syntax)
import cron from "node-cron";

import { runMonitoringCycle } from "./runMonitoringCycle.js";

console.log("worker started — running first cycle, then */5 * * * * (every 5 min)");

await runMonitoringCycle();

// dont start a new cycle if the last one is still going (slow network etc)
let busy = false;
const job = cron.schedule(
  "*/5 * * * *",
  async () => {
    if (busy) {
      console.log("skipping tick — previous cycle still running");
      return;
    }
    busy = true;
    try {
      await runMonitoringCycle();
    } catch (e) {
      console.log("cycle crashed:", e);
    } finally {
      busy = false;
    }
  },
  { timezone: "UTC" }
);

function shutdown() {
  console.log("shutting down worker...");
  job.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
