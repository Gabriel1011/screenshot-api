import { BrowserProvider } from './base.provider.js';
import { chromium } from 'playwright';
import UserAgent from 'user-agents';

export class PlaywrightProvider extends BrowserProvider {
  async createBrowser(options = {}) {
    const defaultOptions = {
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
      ],
      headless: true,
      ignoreHTTPSErrors: true
    };

    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      console.info('Using system Chromium for Playwright:', process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH);
      defaultOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.info('Using Puppeteer Chromium path for Playwright:', process.env.PUPPETEER_EXECUTABLE_PATH);
      defaultOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else {
      console.info('Using Playwright managed browsers');
    }

    const mergedOptions = { ...defaultOptions, ...options };
    return await chromium.launch(mergedOptions);
  }

  async createPage(browser) {
    const context = await browser.newContext();
    const page = await context.newPage();

    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    await context.setExtraHTTPHeaders({ 'User-Agent': userAgent.toString() });

    await page.setViewportSize({
      width: 1280,
      height: 800
    });

    page._browser = browser;

    return page;
  }

  async navigateTo(page, url, options = {}) {
    const defaultOptions = { waitUntil: 'load', timeout: 60000 };
    const mergedOptions = { ...defaultOptions, ...options };
    return await page.goto(url, mergedOptions);
  }

  async takeScreenshot(page, options = {}) {
    const defaultOptions = { fullPage: false };
    const mergedOptions = { ...defaultOptions, ...options };
    return await page.screenshot(mergedOptions);
  }

  async setupRequestInterception(page, handler) {
    await page.route('**/*', async (route, request) => {
      const req = {
        resourceType: () => request.resourceType(),
        url: () => request.url(),
        abort: () => route.abort(),
        continue: () => route.continue()
      };

      handler(req);
    });
  }

  removeListeners(page, event) {
    page.unroute('**/*');
  }

  async closePage(page) {
    await page.close();
  }

  async closeBrowser(browser) {
    await browser.close();
  }

  async getBrowserPages(browser) {
    const contexts = browser.contexts();
    const pages = [];

    for (const context of contexts) {
      const contextPages = context.pages();
      pages.push(...contextPages);
    }

    return pages;
  }

  getPageBrowser(page) {
    return page._browser;
  }

  isPageClosed(page) {
    try {
      const url = page.url();
      return false;
    } catch (error) {
      return true;
    }
  }
}
