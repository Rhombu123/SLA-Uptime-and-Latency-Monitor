// one-shot: run a single monitoring pass then exit (good for manual testing + cron "npm start")
import { runMonitoringCycle } from "./runMonitoringCycle.js";
await runMonitoringCycle();
