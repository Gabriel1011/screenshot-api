import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  // Configurações do pool de browsers
  browser: {
    maxBrowsers: parseInt(process.env.MAX_BROWSERS || '1', 10),
    maxPagesPerBrowser: parseInt(process.env.MAX_PAGES_PER_BROWSER || '10', 10),
    idleTimeoutMs: parseInt(process.env.IDLE_TIMEOUT_MS || '300000', 10),
  },

  // Configurações de providers
  providers: {
    v1: process.env.V1_ADAPTER || 'puppeteer',
    v2: process.env.V2_ADAPTER || 'playwright',
  },
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    },
    launchOptions: {
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--disable-blink-features=AutomationControlled",
        "--disable-extensions",
        "--disable-default-apps",
        "--disable-features=site-per-process",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
      ]
    }
  }
};
