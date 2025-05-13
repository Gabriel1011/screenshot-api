// src/services/browser-pool.service.js
import config from '../config/index.js';
import { createBrowserProvider } from '../providers/index.js';
import { createPool } from 'generic-pool';

class BrowserPool {
  constructor(providerType) {
    this.provider = createBrowserProvider(providerType);
    this.maxBrowsers = config.browser.maxBrowsers;
    this.maxPagesPerBrowser = config.browser.maxPagesPerBrowser;
    this.idleTimeoutMs = config.browser.idleTimeoutMs;

    this.browsers = new Set();
    this.browserUsage = new Map();

    const factory = {
      create: async () => {
        let browser = [...this.browsers].find(b =>
          (this.browserUsage.get(b) || new Set()).size < this.maxPagesPerBrowser
        );
        if (!browser) {
          browser = await this.provider.createBrowser();
          this.browsers.add(browser);
          this.browserUsage.set(browser, new Set());
          console.info(`Created new browser (${this.browsers.size}/${this.maxBrowsers})`);
        }
        const page = await this.provider.createPage(browser);
        this.browserUsage.get(browser).add(page);
        return { browser, page };
      },
      destroy: async ({ browser, page }) => {
        await this.provider.closePage(page);
        const usage = this.browserUsage.get(browser);
        usage.delete(page);
        if (usage.size === 0) {
          await this.provider.closeBrowser(browser);
          this.browsers.delete(browser);
          this.browserUsage.delete(browser);
          console.info('Closed idle browser');
        }
      },
      validate: async ({ page }) => {
        try {
          if (typeof page.isClosed === 'function') {
            return !page.isClosed();
          }
          await page.url();
          return true;
        } catch {
          return false;
        }
      }
    };

    this.pool = createPool(factory, {
      max: this.maxBrowsers * this.maxPagesPerBrowser,
      min: 0,
      idleTimeoutMillis: this.idleTimeoutMs,
      acquireTimeoutMillis: config.browser.acquireTimeoutMs,
      testOnBorrow: true,
      testOnReturn: true,
      evictionRunIntervalMillis: this.idleTimeoutMs / 2,
      autostart: true
    });

    console.info(`Browser pool created with max ${this.maxBrowsers} browsers and ${this.maxPagesPerBrowser} pages per browser.`);
  }

  async getPage() {
    const resource = await this.pool.acquire();
    const { page } = resource;

    const wrapped = {
      page,
      release: async () => {
        await this.pool.release(resource);
      },
      isPageClosed: async () => {
        if (typeof page.isClosed === 'function') return page.isClosed();
        try { await page.url(); return false; }
        catch { return true; }
      },
      ensureValidPage: async () => {
        const closed = await wrapped.isPageClosed();
        if (closed) {
          await wrapped.release();
          const next = await this.getPage();
          return next.page;
        }
        return page;
      }
    };

    return wrapped;
  }

  async closeAll() {
    await this.pool.drain();
    await this.pool.clear();
  }
}

function createBrowserPool(providerType) {
  return new BrowserPool(providerType);
}

export const v1Pool = createBrowserPool(config.providers.v1);
export const v2Pool = createBrowserPool(config.providers.v2);

/**
 * Limpa todos os recursos dos pools de browsers
 */
export const cleanupPools = async () => {
  try {
    await Promise.all([
      v1Pool.closeAll(),
      v2Pool.closeAll()
    ]);
    console.info('All browser resources cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
