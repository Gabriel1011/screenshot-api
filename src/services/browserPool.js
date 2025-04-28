import { createBrowser, createPage } from './browser.js';

const MAX_BROWSERS = parseInt(process.env.MAX_BROWSERS || '3', 10);

class BrowserPool {
  constructor(maxBrowsers = MAX_BROWSERS) {
    this.browsers = [];
    this.maxBrowsers = maxBrowsers;
    this.inUse = new Set();
    console.info(`Browser pool initialized with maximum capacity of ${maxBrowsers}`);
  }

  async getBrowser() {
    const availableBrowser = this.browsers.find(browser => !this.inUse.has(browser));

    if (availableBrowser) {
      this.inUse.add(availableBrowser);
      return availableBrowser;
    }

    if (this.browsers.length < this.maxBrowsers) {
      const newBrowser = await createBrowser();
      this.browsers.push(newBrowser);
      this.inUse.add(newBrowser);
      console.info(`New browser created. Total: ${this.browsers.length}/${this.maxBrowsers}`);
      return newBrowser;
    }

    console.info('Waiting for available browser...');
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const browser = this.browsers.find(browser => !this.inUse.has(browser));
        if (browser) {
          clearInterval(checkInterval);
          this.inUse.add(browser);
          resolve(browser);
        }
      }, 100);
    });
  }

  releaseBrowser(browser) {
    if (this.inUse.has(browser)) {
      this.inUse.delete(browser);
      console.info(`Browser released. In use: ${this.inUse.size}/${this.browsers.length}`);
    }
  }

  async closeAll() {
    console.info('Closing all browsers...');
    await Promise.all(this.browsers.map(browser => browser.close()));
    this.browsers = [];
    this.inUse.clear();
    console.info('All browsers have been closed');
  }
}

// Singleton
const browserPool = new BrowserPool();

export default browserPool;
