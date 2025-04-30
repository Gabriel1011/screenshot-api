import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  browser: {
    maxBrowsers: parseInt(process.env.MAX_BROWSERS || '1', 10),
    maxPagesPerBrowser: parseInt(process.env.MAX_PAGES_PER_BROWSER || '10', 10),
    idleTimeoutMs: parseInt(process.env.IDLE_TIMEOUT_MS || '300000', 10),
    acquireTimeoutMs: Number(process.env.ACQUIRE_TIMEOUT_MS) || 60000,
  },

  providers: {
    v1: process.env.V1_ADAPTER || 'puppeteer',
    v2: process.env.V2_ADAPTER || 'playwright',
  },
};
