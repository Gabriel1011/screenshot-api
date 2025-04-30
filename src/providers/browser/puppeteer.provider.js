import { BrowserProvider } from './base.provider.js';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer';

export class PuppeteerProvider extends BrowserProvider {
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
      ignoreHTTPSErrors: true,
      pipe: true,
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
      }
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.info('Using system Chromium for Puppeteer:', process.env.PUPPETEER_EXECUTABLE_PATH);
      defaultOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else {
      console.info('Using Puppeteer managed browser');
    }

    const mergedOptions = { ...defaultOptions, ...options };
    return await puppeteer.launch(mergedOptions);
  }

  async createPage(browser) {
    const page = await browser.newPage();

    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    await page.setUserAgent(userAgent.toString());

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
    await page.setRequestInterception(true);
    page.on('request', handler);
  }

  removeListeners(page, event) {
    if (event) {
      page.removeAllListeners(event);
    } else {
      page.removeAllListeners('request');
      page.removeAllListeners('response');
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
    }
  }

  async closePage(page) {
    await page.close();
  }

  async closeBrowser(browser) {
    await browser.close();
  }

  async getBrowserPages(browser) {
    return await browser.pages();
  }

  getPageBrowser(page) {
    return page.browser();
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