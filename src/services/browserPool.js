import { createBrowser, createPage } from './browser.js';

const MAX_PAGES_PER_BROWSER = parseInt(process.env.MAX_PAGES_PER_BROWSER || '10', 10);
const MAX_BROWSERS = parseInt(process.env.MAX_BROWSERS || '3', 10);
const IDLE_TIMEOUT_MS = parseInt(process.env.IDLE_TIMEOUT_MS || '300000', 10);

class BrowserPool {
  constructor() {
    this.browsers = [];
    this.pages = [];
    this.inUse = new Set();
    this.lastUsed = new Map();
    this.cleanupInterval = null;

    console.info(`Browser pool initialized with max ${MAX_BROWSERS} browsers and ${MAX_PAGES_PER_BROWSER} pages per browser`);
    console.info(`Resources will be closed after ${IDLE_TIMEOUT_MS / 60000} minutes of inactivity`);

    this.startCleanupInterval();
  }

  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => this.cleanupIdleResources(), 60000);
  }

  async cleanupIdleResources() {
    const now = Date.now();

    for (const page of this.pages) {
      if (!this.inUse.has(page) && this.lastUsed.has(page)) {
        const idleTime = now - this.lastUsed.get(page);

        if (idleTime > IDLE_TIMEOUT_MS) {
          console.info(`Closing idle page (inactive for ${Math.round(idleTime / 60000)} minutes)`);
          await page.close().catch(err => console.error('Error closing page:', err));
          this.pages = this.pages.filter(p => p !== page);
          this.lastUsed.delete(page);
        }
      }
    }

    for (const browser of this.browsers) {
      const browserPages = await browser.pages().catch(() => []);

      if (browserPages.length <= 1) {
        const browserHasActivePage = this.pages.some(page => {
          try {
            return page.browser() === browser;
          } catch {
            return false;
          }
        });

        if (!browserHasActivePage) {
          console.info('Closing idle browser with no active pages');
          await browser.close().catch(err => console.error('Error closing browser:', err));
          this.browsers = this.browsers.filter(b => b !== browser);
        }
      }
    }
  }

  async getBrowser() {
    for (const browser of this.browsers) {
      try {
        const pages = await browser.pages();
        if (pages.length < MAX_PAGES_PER_BROWSER + 1) {
          return browser;
        }
      } catch (error) {
        console.error('Error checking browser:', error);
      }
    }

    if (this.browsers.length < MAX_BROWSERS) {
      try {
        const newBrowser = await createBrowser();
        this.browsers.push(newBrowser);
        console.info(`New browser created. Total browsers: ${this.browsers.length}/${MAX_BROWSERS}`);
        return newBrowser;
      } catch (error) {
        console.error('Error creating browser:', error);
        throw error;
      }
    }

    let minPages = Infinity;
    let selectedBrowser = null;

    for (const browser of this.browsers) {
      try {
        const pages = await browser.pages();
        if (pages.length < minPages) {
          minPages = pages.length;
          selectedBrowser = browser;
        }
      } catch (error) {
        console.error('Error checking browser pages:', error);
      }
    }

    if (selectedBrowser) {
      return selectedBrowser;
    }

    throw new Error('No browsers available and cannot create more');
  }

  async getPage() {
    try {
      const browser = await this.getBrowser();
      const newPage = await createPage(browser);

      this.pages.push(newPage);
      this.inUse.add(newPage);

      const browserPages = await browser.pages();
      console.info(`New page created. Browser now has ${browserPages.length - 1}/${MAX_PAGES_PER_BROWSER} pages. Total pages in pool: ${this.pages.length}`);

      return newPage;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  async releasePage(page) {
    if (this.inUse.has(page)) {
      this.inUse.delete(page);

      try {
        await page.close();
        console.info('Page closed after use');

        this.pages = this.pages.filter(p => p !== page);
        this.lastUsed.delete(page);

        try {
          const browser = page.browser();
          const browserPages = await browser.pages();

          if (browserPages.length <= 1) {
            console.info('Closing browser with no active pages');
            await browser.close().catch(err => console.error('Error closing browser:', err));
            this.browsers = this.browsers.filter(b => b !== browser);
          }
        } catch (error) {
          console.error('Error checking browser after page close:', error);
        }
      } catch (error) {
        console.error('Error closing page:', error);
      }
    }
  }

  async closeAll() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.info('Closing all browsers...');

    this.pages = [];
    this.inUse.clear();
    this.lastUsed.clear();

    await Promise.all(this.browsers.map(browser =>
      browser.close().catch(err => console.error('Error closing browser during cleanup:', err))
    ));

    this.browsers = [];
    console.info('All browsers have been closed');
  }
}

const browserPool = new BrowserPool();

process.on('SIGINT', async () => {
  console.info('SIGINT received, closing all browsers...');
  await browserPool.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.info('SIGTERM received, closing all browsers...');
  await browserPool.closeAll();
  process.exit(0);
});

export default browserPool;
