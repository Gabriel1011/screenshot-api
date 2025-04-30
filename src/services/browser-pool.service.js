import config from '../config/index.js';
import { createBrowserProvider } from '../providers/index.js';

class BrowserPool {
  constructor(providerType) {
    this.provider = createBrowserProvider(providerType);
    this.maxBrowsers = config.browser.maxBrowsers;
    this.maxPagesPerBrowser = config.browser.maxPagesPerBrowser;
    this.idleTimeoutMs = config.browser.idleTimeoutMs;

    this.browsers = new Set();
    this.browserUsage = new Map();
    this.browserLastUsed = new Map();
    this.queue = [];

    this.cleanupTimer = setInterval(() => this.cleanupIdleBrowsers(), 60000);
  }

  async getPage() {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.queue.length === 0) return;

    for (const browser of this.browsers) {
      const pages = this.browserUsage.get(browser) || new Set();
      if (pages.size < this.maxPagesPerBrowser) {
        await this.fulfillRequest(browser);
        return;
      }
    }

    if (this.browsers.size < this.maxBrowsers) {
      try {
        const newBrowser = await this.provider.createBrowser();
        this.browsers.add(newBrowser);
        this.browserUsage.set(newBrowser, new Set());
        this.browserLastUsed.set(newBrowser, Date.now());
        console.info(`Created new browser (${this.browsers.size}/${this.maxBrowsers})`);
        await this.fulfillRequest(newBrowser);
      } catch (err) {
        console.error('Error creating browser:', err);
        this.queue.shift()?.reject(err);
      }
    }
  }

  async fulfillRequest(browser) {
    const request = this.queue.shift();
    if (!request) return;

    try {
      const page = await this.provider.createPage(browser);
      const usageSet = this.browserUsage.get(browser);
      usageSet.add(page);
      this.browserLastUsed.set(browser, Date.now());

      const wrappedPage = {
        page,
        release: async () => {
          try {
            await this.provider.closePage(page);
            usageSet.delete(page);
            this.browserLastUsed.set(browser, Date.now());
            this.processQueue();
          } catch (err) {
            console.error('Error releasing page:', err);
          }
        }
      };

      request.resolve(wrappedPage);
    } catch (err) {
      console.error('Error creating page:', err);
      request.reject(err);
    }
  }

  async cleanupIdleBrowsers() {
    const now = Date.now();

    for (const browser of [...this.browsers]) {
      const usageSet = this.browserUsage.get(browser) || new Set();
      if (usageSet.size === 0) {
        const lastUsed = this.browserLastUsed.get(browser) || 0;
        if (now - lastUsed > this.idleTimeoutMs) {
          try {
            await this.provider.closeBrowser(browser);
            this.browsers.delete(browser);
            this.browserUsage.delete(browser);
            this.browserLastUsed.delete(browser);
            console.info('Closed idle browser');
          } catch (err) {
            console.error('Error closing idle browser:', err);
          }
        }
      }
    }
  }

  async closeAll() {
    clearInterval(this.cleanupTimer);
    for (const browser of this.browsers) {
      try {
        await this.provider.closeBrowser(browser);
      } catch (err) {
        console.error('Error closing browser during shutdown:', err);
      }
    }
    this.browsers.clear();
    this.browserUsage.clear();
    this.browserLastUsed.clear();
    this.queue = [];
    console.info('All browsers closed');
  }
}

export function createBrowserPool(providerType) {
  return new BrowserPool(providerType);
}
