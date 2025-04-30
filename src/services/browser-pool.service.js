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
    this.browsersBeingCreated = 0;

    this.cleanupTimer = setInterval(() => this.cleanupIdleBrowsers(), 60000);

    console.info(`Browser pool initialized with ${this.maxBrowsers} max browsers and ${this.maxPagesPerBrowser} max pages per browser`);
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

    if (this.browsers.size + this.browsersBeingCreated < this.maxBrowsers) {
      try {
        this.browsersBeingCreated++;

        const newBrowser = await this.provider.createBrowser();
        this.browsers.add(newBrowser);
        this.browserUsage.set(newBrowser, new Set());
        this.browserLastUsed.set(newBrowser, Date.now());
        console.info(`Created new browser (${this.browsers.size}/${this.maxBrowsers})`);

        this.browsersBeingCreated--;

        await this.fulfillRequest(newBrowser);
      } catch (err) {
        this.browsersBeingCreated--;

        console.error('Error creating browser:', err);
        this.queue.shift()?.reject(err);
      }
    } else if (this.queue.length > 0) {
    }
  }

  async isPageClosed(page) {
    try {
      if (!page) return true;

      if (typeof page.isClosed === 'function') {
        return page.isClosed();
      }

      await page.url();
      return false;
    } catch (err) {
      return true;
    }
  }

  async fulfillRequest(browser) {
    const request = this.queue.shift();
    if (!request) return;

    try {
      if (!this.browsers.has(browser)) {
        throw new Error('Browser is no longer in the pool');
      }

      const page = await this.provider.createPage(browser);
      const usageSet = this.browserUsage.get(browser);
      usageSet.add(page);
      this.browserLastUsed.set(browser, Date.now());

      const wrappedPage = {
        page,
        release: async () => {
          try {
            const isPageClosed = await this.isPageClosed(page);

            if (!isPageClosed && this.browsers.has(browser) && usageSet.has(page)) {
              await this.provider.closePage(page);
            } else if (isPageClosed) {
              console.warn('Attempted to release an already closed page');
            }

            usageSet.delete(page);
            this.browserLastUsed.set(browser, Date.now());
            this.processQueue();
          } catch (err) {
            console.error('Error releasing page:', err);
            usageSet.delete(page);
            this.processQueue();
          }
        },
        isPageClosed: async () => {
          return await this.isPageClosed(page);
        },
        ensureValidPage: async () => {
          if (await this.isPageClosed(page)) {
            console.warn('Detected closed page, requesting new page...');
            usageSet.delete(page);

            try {
              const newPage = await this.provider.createPage(browser);
              usageSet.add(newPage);
              this.browserLastUsed.set(browser, Date.now());

              wrappedPage.page = newPage;
              return newPage;
            } catch (err) {
              console.error('Error creating replacement page:', err);
              throw err;
            }
          }
          return page;
        }
      };

      request.resolve(wrappedPage);
    } catch (err) {
      console.error('Error creating page:', err);
      request.reject(err);
      this.processQueue();
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
