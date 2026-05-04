// built-in urls when MONITOR_URLS is not set — real sites, good for "is the internet up" style demos
// still better for production to set MONITOR_URLS to YOUR own health endpoints so you are not leaning on strangers
export const BUILTIN_MONITOR_URLS: string[] = [
  "https://example.com",
  "https://www.w3.org/",
  "https://www.wikipedia.org/",
  "https://www.youtube.com/",
  "https://www.cloudflare.com/",
  "https://www.debian.org/",
  "https://1.1.1.1/",
  "https://quad9.net/",
  "https://www.google.com/generate_204",
  "https://connectivitycheck.gstatic.com/generate_204",
  "https://captive.apple.com/hotspot-detect.html"
];
