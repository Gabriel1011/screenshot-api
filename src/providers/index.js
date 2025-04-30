import { PuppeteerProvider } from './browser/puppeteer.provider.js';
import { PlaywrightProvider } from './browser/playwright.provider.js';

/**
 * Cria um adapter de browser baseado no tipo especificado
 * @param {string} type - Tipo de adapter ('puppeteer' ou 'playwright')
 * @returns {BrowserProvider} Instância do adapter
 */
export function createBrowserProvider(type = 'puppeteer') {
  switch (type.toLowerCase()) {
    case 'puppeteer':
      return new PuppeteerProvider();
    case 'playwright':
      return new PlaywrightProvider();
    default:
      throw new Error(`Unsupported browser adapter type: ${type}`);
  }
}
